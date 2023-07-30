from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from ujson import loads, dumps
from base64 import b64decode
from random import sample
from os import environ
from time import time
import string
import redis

#速率限制：每IP每limitTime秒可以请求limitFrequency次API
limitTime = 30
limitFrequency = 5

connection = redis.ConnectionPool(
    host=environ.get("REDIS_HOST"),
    port=environ.get("REDIS_PORT"),
    password=environ.get("REDIS_PWD"),
    decode_responses=True,
    health_check_interval=30
)
redisRes = redis.StrictRedis(connection_pool=connection)

def limit_cache(func):
    limit_data = {}
    def run_func(*args, **kwargs):
        limit_key = ".".join(args)
        limit_value = limit_data.get(limit_key, None)
        if limit_value == None:
            limit_value = func(*args, **kwargs)
        if time() > limit_value['time'] + limitTime:
            limit_value = func(*args, **kwargs)
        limit_value['frequency'] += 1
        limit_data[limit_key] = limit_value
        if limit_value['frequency'] > limitFrequency:
            return True
        return False
    return run_func

@limit_cache
def limit(ip):
    return({'frequency': 0, 'time': time()})

def read_data(id):
    redisData = redisRes.get(id)
    if redisData == None:
        return None
    value = loads(redisData)
    if value['1']:
        return {'fin': True, 'id': id, 'data': value, 'ttl': redisRes.ttl(id)}
    return {'fin': False, 'id': id, 'data': value, 'ttl': redisRes.ttl(id)}

def save_data(id, data, word):
    redisData = redisRes.get(id)
    if redisData == None:
        redisRes.set("c", id)
        value = {'w': word, '0': data, '1': None}
        redisRes.setex(id, 604800, dumps(value))
        return {'fin': False, 'id': id, 'data': value, 'ttl': redisRes.ttl(id)}
    value = loads(redisData)
    if value['1']:
        return {'fin': True, 'id': id, 'data': 'hidden', 'ttl': redisRes.ttl(id)}
    value['1'] = data
    redisRes.setex(id, redisRes.ttl(id), dumps(value))
    return {'fin': True, 'id': id, 'data': value, 'ttl': redisRes.ttl(id)}

class handler(BaseHTTPRequestHandler):
    def handle_request(self, code, content_type, opt):
        self.send_response(code)
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type,Content-Length,Accept-Encoding,X-Requested-with,Origin')
        self.send_header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', content_type)
        self.end_headers()
        self.wfile.write(opt.encode(encoding='UTF-8'))
        return

    def do_GET(self):
        input_header = self.headers
        userip = input_header.get("X-Real-IP")
        url = "https://cnfq.klee.xin" + self.path
        input_data = parse_qs(urlparse(url).query)
        if limit(userip):
            opt = {'code': 429, 'data': None}
            self.handle_request(429, 'application/json', dumps(opt))
            return
        id = input_data.get("id", [False])[0]
        method = input_data.get("method", [False])[0]
        if id:
            value = read_data(id)
            if not value:
                opt = {'code': 404, 'data': None}
                self.handle_request(404, 'application/json', dumps(opt))
                return
        if method == "read":
            word = input_data.get("word", [False])[0]
            try:
                if not value['fin'] and not word == value['data']['w']:
                    opt = {'code': 403, 'data': None}
                    self.handle_request(403, 'application/json', dumps(opt))
                    return
            except:
                opt = {'code': 500, 'data': None}
                self.handle_request(500, 'application/json', dumps(opt))
                return
            opt = {'code': 200, 'data': value}
            self.handle_request(200, 'application/json', dumps(opt))
            return
        elif method == "save":
            data = input_data.get("data", [False])[0]
            word = ''.join(sample(string.ascii_letters + string.digits, 4))
            try:
                data = loads(b64decode(data).decode("utf-8"))['data']
            except:
                opt = {'code': 500, 'data': None}
                self.handle_request(500, 'application/json', dumps(opt))
                return
            if not id:
                counter = redisRes.get("c")
                if counter == None:
                    counter = 0
                id = int(counter) + 1
            value = save_data(id, data, word)
            opt = {'code': 200, 'data': value}
            self.handle_request(200, 'application/json', dumps(opt))
            return
        else:
            opt = {'code': 500, 'data': None}
            self.handle_request(500, 'application/json', dumps(opt))
            return
