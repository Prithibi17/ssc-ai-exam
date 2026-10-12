import json
from http.server import BaseHTTPRequestHandler
import sys
import os

# Add local directory to sys.path so extractor can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from extractor import QuestionExtractor

def wsgi_app(environ, start_response):
    path = environ.get('PATH_INFO', '/')
    method = environ.get('REQUEST_METHOD', 'GET')
    
    if method == 'GET' and (path == '/' or path == '/health'):
        response_body = json.dumps({"status": "ok", "service": "python_worker"}).encode('utf-8')
        start_response('200 OK', [('Content-Type', 'application/json'), ('Content-Length', str(len(response_body)))])
        return [response_body]

    if method == 'POST' and (path == '/extract' or path == '/'):
        try:
            content_length = int(environ.get('CONTENT_LENGTH', 0))
        except (ValueError, TypeError):
            content_length = 0
            
        request_body = environ['wsgi.input'].read(content_length) if content_length > 0 else b'{}'
        try:
            data = json.loads(request_body.decode('utf-8'))
        except Exception:
            data = {}

        raw_text = data.get('text', '')
        exam_code = data.get('examCode', 'ssc_cgl')
        year = int(data.get('year', 2023))
        shift = int(data.get('shift', 1))
        tier = data.get('tier', 'Tier-1')

        extractor = QuestionExtractor(exam_code=exam_code, year=year, shift=shift, tier=tier)
        questions = extractor.parse_raw_text(raw_text)

        result = {
            "success": True,
            "extractedCount": len(questions),
            "questions": questions,
            "logs": extractor.logs
        }
        response_body = json.dumps(result).encode('utf-8')
        start_response('200 OK', [('Content-Type', 'application/json'), ('Content-Length', str(len(response_body)))])
        return [response_body]

    response_body = json.dumps({"error": "Not Found", "path": path}).encode('utf-8')
    start_response('404 Not Found', [('Content-Type', 'application/json'), ('Content-Length', str(len(response_body)))])
    return [response_body]

app = wsgi_app
application = wsgi_app

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok", "service": "python_worker"}).encode('utf-8'))

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        try:
            data = json.loads(post_data.decode('utf-8'))
        except Exception:
            data = {}

        raw_text = data.get('text', '')
        exam_code = data.get('examCode', 'ssc_cgl')
        year = int(data.get('year', 2023))
        shift = int(data.get('shift', 1))
        tier = data.get('tier', 'Tier-1')

        extractor = QuestionExtractor(exam_code=exam_code, year=year, shift=shift, tier=tier)
        questions = extractor.parse_raw_text(raw_text)

        result = {
            "success": True,
            "extractedCount": len(questions),
            "questions": questions,
            "logs": extractor.logs
        }
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode('utf-8'))
