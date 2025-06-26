function loadContacts() {
    fetch('../backend/contacts.php?action=list')
        .then(response => response.json())
        .then(data => {
            const listDiv = document.getElementById('contact-list');
            if (data.length === 0) {
                listDiv.innerHTML = '<p>No contacts found.</p>';
                return;
            }
            let html = '<table><tr><th>Name</th><th>Surname</th><th>Email</th></tr>';
            data.forEach(contact => {
                html += `<tr>
                    <td>${contact.name}</td>
                    <td>${contact.surname}</td>
                    <td>${contact.email}</td>
                </tr>`;
            });
            html += '</table>';
            listDiv.innerHTML = html;
        });
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
        const response = await fetch('../backend/contacts.php?action=add', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            hideContactForm();
            loadContacts();
        } else {
            document.getElementById('contact-form-error').textContent = result.error || 'Error adding contact.';
        }
    };
}

function hideContactForm() {
    document.getElementById('contact-form-container').style.display = 'none';
}

// Optionally load on startup or when switching tabs
// document.addEventListener('DOMContentLoaded', loadContacts);