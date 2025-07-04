from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import sqlite3

app = Flask(__name__)
CORS(app)

def get_db():
    conn = sqlite3.connect('client_contact.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS client_contact (
            client_id INTEGER NOT NULL,
            contact_id INTEGER NOT NULL,
            PRIMARY KEY (client_id, contact_id),
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
            FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/clients', methods=['GET', 'POST'])
def clients():
    if request.method == 'GET':
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, code FROM clients ORDER BY name ASC")
        clients = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(clients)
    
    if request.method == 'POST':
        data = request.json
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'success': False, 'error': 'Name is required.'}), 400

        letters = ''.join([c for c in name.upper() if c.isalpha()])[:3].ljust(3, 'A')
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT code FROM clients WHERE code LIKE ? ORDER BY code DESC LIMIT 1", (letters + '%',))
        last = cursor.fetchone()
        num = 1
        if last:
            last_num = int(last['code'][3:])
            num = last_num + 1
        code = f"{letters}{num:03d}"
        try:
            cursor.execute("INSERT INTO clients (name, code) VALUES (?, ?)", (name, code))
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
        finally:
            conn.close()

@app.route('/contacts', methods=['GET', 'POST'])
def contacts():
    if request.method == 'GET':
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, surname, email FROM contacts ORDER BY name ASC, surname ASC")
        contacts = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(contacts)
    
    if request.method == 'POST':
        data = request.json
        name = data.get('name', '').strip()
        surname = data.get('surname', '').strip()
        email = data.get('email', '').strip()
        if not name or not surname or not email:
            return jsonify({'success': False, 'error': 'All fields are required.'}), 400
        if '@' not in email or '.' not in email:
            return jsonify({'success': False, 'error': 'Invalid email.'}), 400

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM contacts WHERE email = ?", (email,))
        if cursor.fetchone()[0] > 0:
            conn.close()
            return jsonify({'success': False, 'error': 'Email already exists.'}), 400
        try:
            cursor.execute("INSERT INTO contacts (name, surname, email) VALUES (?, ?, ?)", (name, surname, email))
            conn.commit()
            return jsonify({'success': True})
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
        finally:
            conn.close()

@app.route('/clients/<int:client_id>/contacts', methods=['GET'])
def get_client_contacts(client_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT contacts.id, contacts.name, contacts.surname, contacts.email
        FROM contacts
        JOIN client_contact ON contacts.id = client_contact.contact_id
        WHERE client_contact.client_id = ?
        ORDER BY contacts.surname ASC, contacts.name ASC
    ''', (client_id,))
    contacts = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(contacts)

@app.route('/client_contact/unlink', methods=['POST'])
def unlink_contact():
    data = request.json
    client_id = data.get('client_id')
    contact_id = data.get('contact_id')
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM client_contact WHERE client_id = ? AND contact_id = ?', (client_id, contact_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/client_contact/link', methods=['POST'])
def link_contact():
    data = request.json
    client_id = data.get('client_id')
    contact_id = data.get('contact_id')
    if not client_id or not contact_id:
        return jsonify({'success': False, 'error': 'Missing client or contact ID.'}), 400
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT OR IGNORE INTO client_contact (client_id, contact_id) VALUES (?, ?)",
            (client_id, contact_id)
        )
        conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/clients/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM clients WHERE id = ?', (client_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/contacts/<int:contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM contacts WHERE id = ?', (contact_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Add similar endpoints for linking clients and contacts

if __name__ == '__main__':
    init_db()
    app.run(debug=True)