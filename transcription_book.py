import json

def text_to_json(input_file, output_file):
    # Lire le contenu du fichier texte
    with open(input_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    # Diviser le texte en paragraphes
    paragraphs = []
    paragraph = ""
    
    for line in lines:
        # Conserver les espaces en début de ligne pour les dialogues
        stripped_line = line.rstrip()
        if stripped_line:
            if paragraph:
                paragraph += " " + stripped_line
            else:
                paragraph = stripped_line
        else:
            if paragraph:
                paragraphs.append(paragraph)
                paragraph = ""

    # Ajouter le dernier paragraphe s'il existe
    if paragraph:
        paragraphs.append(paragraph)

    # Structurer les données
    chapter = {
        "id": 1,
        "title": "Chapitre 1",
        "paragraphs": []
    }

    for i, paragraph in enumerate(paragraphs):
        chapter["paragraphs"].append({
            "paragraph_id": i + 1,
            "text": paragraph
        })

    book_structure = {
        "chapters": [chapter]
    }

    # Convertir en JSON
    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(book_structure, json_file, ensure_ascii=False, indent=4)

# Spécifier les chemins d'accès des fichiers
input_file = 'static/books/les_fourmis.txt'
output_file = 'static/books/les_fourmis_chapters.json'

# Appeler la fonction pour convertir le texte en JSON
text_to_json(input_file, output_file)
