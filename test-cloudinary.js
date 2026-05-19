const fs = require('fs');
async function test() {
    const formData = new FormData();
    const blob = new Blob(['dummy content'], { type: 'text/plain' });
    formData.append('file', blob, 'test.txt');
    formData.append('upload_preset', 'ml_default');
    
    const cloudName = 'dp2shlxl3';
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });
    console.log(res.status);
    console.log(await res.json());
}
test();
