export function compressImage(file: File, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Reducir tamaño si es necesario
          let width = img.width;
          let height = img.height;
          if (width > 1200) {
            const ratio = 1200 / width;
            width = 1200;
            height = height * ratio;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Error al comprimir la imagen'));
              }
            },
            'image/jpeg', 
            quality
          );
        };
        img.src = event.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }