async function fetchContacts() {
    const response = await fetch('http://localhost:5000/contacts');
    const contacts = await response.json();
    let html = '<table><tr><th>Name</th><th>Surname</th><th>Email</th><th>Actions</th></tr>';
    contacts.forEach(contact => {
        html += `<tr>
            <td>${contact.name}</td>
            <td>${contact.surname}</td>
            <td>${contact.email}</td>
            <td>
                <button onclick="deleteContact(${contact.id})" style="background:#dc3545;">Delete</button>
            </td>
        </tr>`;
    });
    html += '</table>';
    document.getElementById('contact-list').innerHTML = contacts.length ? html : '<p>No contacts found.</p>';
}

function loadContactForm() {
    const formHtml = `
        <form id="contact-form">
            <label>Name: <input type="text" name="name" required></label>
            <label>Surname: <input type="text" name="surname" required></label>
            <label>Email: <input type="email" name="email" required></label>
            <button type="submit">Save</button>
            <button type="button" onclick="hideContactForm()">Cancel</button>
        </form>
        <div id="contact-form-error" style="color:red;"></div>
    `;
    document.getElementById('contact-form-container').innerHTML = formHtml;
    document.getElementById('contact-form-container').style.display = 'block';

    document.getElementById('contact-form').onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(this);
        const response = await fetch('http://localhost:5000/contacts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.get('name'),
                surname: formData.get('surname'),
                email: formData.get('email')
            })
        });
        const result = await response.json();
        if (result.success) {
            hideContactForm();
            fetchContacts();
        } else {
            document.getElementById('contact-form-error').textContent = result.error || 'Error adding contact.';
        }
    };
}

function hideContactForm() {
    document.getElementById('contact-form-container').style.display = 'none';
}

async function deleteContact(contactId) {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    await fetch(`http://localhost:5000/contacts/${contactId}`, {
        method: 'DELETE'
    });
    fetchContacts();
}

// Load contacts on page load
document.addEventListener('DOMContentLoaded', fetchContacts);