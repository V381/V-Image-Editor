export function uploadImage() {
    const uploadButton = document.querySelector('.upload-button');
    const uploadInput = document.querySelector('.upload-input');
    const imageContainer = document.querySelector('.uploaded-image');

    uploadButton.addEventListener('click', () => {
        uploadInput.click();
    });

    uploadInput.addEventListener('change', handleImageUpload);

    function handleImageUpload() {
        const file = uploadInput.files[0];
        console.log(file)

        if (file) {
            const formData = new FormData();
            formData.append('image', file);

            fetch('/upload', {
              method: 'POST',
              body: formData
            })
            .then(response => response.blob())
            .then(blob => {
                const imageUrl = URL.createObjectURL(blob);
                imageContainer.src = imageUrl;            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }
}
