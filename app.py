from flask import Flask, render_template, jsonify, request
import json
import shutil
import os
from gradio_client import Client

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

def load_books():
    with open('static/books/books.json', encoding='utf-8') as f:
        books = json.load(f)
    return books

def load_chapter(book_name, chapter_id):
    file_path = os.path.join('static', 'books', f'{book_name}.json')
    if not os.path.exists(file_path):
        return None
    with open(file_path) as f:
        data = json.load(f)
    for chapter in data['chapters']:
        if chapter['id'] == chapter_id:
            return chapter
    return None

client = Client("https://myshell-ai-openvoicev2.hf.space/--replicas/yqzem/")

def make_openvoice_request(text, style, reference_audio_url, agree):
    try:
        result = client.predict(
            text,
            style,
            reference_audio_url,
            agree,
            fn_index=1
        )

        return {
            'info': result[0],
            'synthesised_audio_path': result[1],
            'reference_audio_used': result[2]
        }
    except Exception as e:
        return {'error': str(e)}

@app.route('/')
def home():
    books = load_books()
    return render_template('index.html', books=books)

@app.route('/<book_name>')
def book(book_name):
    with open(f'static/books/{book_name}.json', encoding='utf-8') as f:
        book_data = json.load(f)
    chapter_id = 1
    chapter = next((c for c in book_data['chapters'] if c['id'] == chapter_id), None)
    return render_template('book.html', book_name=book_name, chapter=chapter, book_data=book_data)


@app.route('/<book_name>/<int:chapter_id>')
def chapter(book_name, chapter_id):
    chapter = load_chapter(book_name, chapter_id)
    if chapter is None:
        return "Chapter not found", 404
    return render_template('book.html', book_name=book_name, chapter=chapter)

@app.route('/process', methods=['POST'])
def process():
    if request.content_type != 'application/json':
        return jsonify({'error': 'Content-Type must be application/json'}), 415

    input_data = request.json
    text = input_data.get('text')
    style = input_data.get('style', 'en_default')
    reference_audio_url = input_data.get('file_path', '')
    agree = input_data.get('agree', True)

    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    response = make_openvoice_request(text, style, reference_audio_url, agree)

    if 'error' in response:
        return jsonify(response)

    if 'synthesised_audio_path' in response and response['synthesised_audio_path'] is not None:
        source_path = response['synthesised_audio_path']
        destination_path = os.path.join('static', 'audio', os.path.basename(source_path))
        shutil.copy(source_path, destination_path)
        response['synthesised_audio_path'] = destination_path.replace('\\', '/')

    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)
