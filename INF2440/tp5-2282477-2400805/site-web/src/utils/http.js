const SERVER_URL = "http://localhost:5020";

export async function GET(uri) {
    const response = await fetch(`${SERVER_URL}/${uri}`);
    return await response.json();
}

export async function POST(uri, body) {
    const response = await fetch(`${SERVER_URL}/${uri}`,{
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'content-type': 'application/json',
        },
    });
    return await response.json();
}

export async function DELETE(uri, body) {
    const response = await fetch(`${SERVER_URL}/${uri}`,{
        method: 'DELETE',
        body: JSON.stringify(body),
        headers: {
            'content-type': 'application/json',
        },
    });
    return await response.json();
}

export async function PATCH(uri, body) {
    const response = await fetch(`${SERVER_URL}/${uri}`,{
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
            'content-type': 'application/json',
        },
    });
    return await response.json();
}

export async function PUT(uri, body) {
    const response = await fetch(`${SERVER_URL}/${uri}`,{
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
            'content-type': 'application/json',
        },
    });
    return await response.json();
}

