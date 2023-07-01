export function uploadImage() {
    const uploadButton = document.querySelector('.upload-button');
    const uploadInput = document.querySelector('.upload-input');
    const flipButton = document.querySelector(".flip-button");
    const image = document.querySelector('.uploaded-image');
    const saveButton = document.querySelector(".save-button");
    let isFlipped = false;
    let imageData = null;
  
    uploadButton.addEventListener('click', () => {
      uploadInput.click();
    });
  
    flipButton.addEventListener('click', () => {
      if (image.src) {
        flipImage();
      }
    });
  
    uploadInput.addEventListener('change', handleImageUpload);
  
    function handleImageUpload() {
      const file = uploadInput.files[0];
  
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
  
        fetch('/upload', {
          method: 'POST',
          body: formData
        })
        .then(response => response.blob())
        .then(blob => {
          imageData = blob;
          const imageUrl = URL.createObjectURL(blob);
          image.src = imageUrl;
          isFlipped = false;
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
    }
  
    function flipImage() {
        if (isFlipped) {
          image.style.transform = 'scaleX(1)';
          image.style.transition = 'transform 0.3s ease';
        } else {
          image.style.transform = 'scaleX(-1)';
          image.style.transition = 'transform 0.3s ease';
        }
        isFlipped = !isFlipped;
      }
    
    saveButton.addEventListener('click', saveFlippedImage);

    function flipImage() {
        const image = document.querySelector('.image-container img');
        if (image.src) {
            if (isFlipped) {
              image.style.transform = 'scaleX(1)';
              image.style.transition = 'transform 0.3s ease';
            } else {
              image.style.transform = 'scaleX(-1)';
              image.style.transition = 'transform 0.3s ease';
            }
            isFlipped = !isFlipped;
          }
      }
    
      async function saveFlippedImage() {
        if (imageData) {
          let flippedImageData = imageData;
          if (isFlipped) {
            flippedImageData = await flipImageData(imageData);
          }
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(flippedImageData);
          downloadLink.download = 'flipped_image.png';
          downloadLink.click();
        }
      }
    
      function flipImageData(imageData) {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.translate(img.width, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(img, 0, 0);
              canvas.toBlob(resolve, 'image/png');
            };
            img.src = reader.result;
          };
          reader.readAsDataURL(imageData);
        });
      }
  }
  