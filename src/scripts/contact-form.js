import EmailValidator from 'email-validator';

const isProd = import.meta.env.PROD;

const recaptchaErrorMessage = document.querySelector("#recaptcha-error-message");

const fields = [
    document.querySelector("#name-group"),
    document.querySelector("#lastname-group"),
    document.querySelector("#phone-number-group"),
    document.querySelector("#email-group"),
    document.querySelector("#service-group"),
    document.querySelector("#birthdate-group")
]

fields.forEach(field => {
    const input = field.querySelector("input");

    input.addEventListener("input", function() {
        field.classList.remove("invalid");
        field.classList.remove("invalid-format");
    });
});

// Función para validar que un texto contenga solo letras, espacios, acentos y guiones
const isValidTextName = (text) => {
    const trimmedText = text.trim();
    
    if (trimmedText.length === 0) {
        return false;
    }
    
    const hasLetter = /[a-záéíóúñüA-ZÁÉÍÓÚÑÜ]/.test(trimmedText);
    if (!hasLetter) {
        return false;
    }
    
    const validPattern = /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s\-']+$/;
    return validPattern.test(trimmedText);
};

// Función para validar que el número de teléfono no sea solo ceros
const isValidPhoneNumber = (phoneNumber) => {
    // Para eliminar caracteres que no sean dígitos
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    if (digitsOnly.length !== 10) {
        return false;
    }
    
    if (digitsOnly === '0000000000') {
        return false;
    }
    
    // Verifica que todos los numeros no sean iguales
    const allSameDigit = /^(\d)\1{9}$/.test(digitsOnly);
    if (allSameDigit) {
        return false;
    }
    
    return true;
};

// Función para validar la fecha de nacimiento
const isValidBirthdate = (dateString) => {
    const birthdate = new Date(dateString);
    const today = new Date();
    
    // Resetear horas para comparación de solo fechas
    today.setHours(0, 0, 0, 0);
    birthdate.setHours(0, 0, 0, 0);
    
    // Verificar que la fecha no sea futura
    if (birthdate >= today) {
        return false;
    }
    
    // Calcular edad para que no se pasen de chistosos
    const age = Math.floor((today - birthdate) / (365.25 * 24 * 60 * 60 * 1000));
    
    // Verificar que la edad sea entre 10 y 100 años
    if (age < 5 || age > 120) {
        return false;
    }
    
    return true;
};

// Función para validar servicio de interés
const isValidService = (text) => {
    // Eliminar espacios en blanco al inicio y final
    const trimmedText = text.trim();
    
    // Verificar que no esté vacío después de trim
    if (trimmedText.length === 0) {
        return false;
    }
    
    // Verificar que contenga al menos una letra
    const hasLetter = /[a-záéíóúñüA-ZÁÉÍÓÚÑÜ]/.test(trimmedText);
    if (!hasLetter) {
        return false;
    }
    
    return true;
};

const handleSubmit = async event => {
    event.preventDefault();

    let valid = true;

    // Validar que todos los campos tengan información
    for (let field of fields) {
        const input = field.querySelector("input");

        if (!input.value) {
            field.classList.add("invalid");
            valid = false;
        }
    }

    // Evitar el envio del formuario si algún campo no tiene información
    if (!valid) {
        return;
    }

    // Validar nombre
    const nameGroup = document.querySelector("#name-group");
    const nameInput = nameGroup.querySelector("input");
    if (!isValidTextName(nameInput.value)) {
        nameGroup.classList.add("invalid-format");
        valid = false;
    }

    // Validar apellidos
    const lastnameGroup = document.querySelector("#lastname-group");
    const lastnameInput = lastnameGroup.querySelector("input");
    if (!isValidTextName(lastnameInput.value)) {
        lastnameGroup.classList.add("invalid-format");
        valid = false;
    }

    // Validar que el número de contacto este completo y sea válido
    const phoneNumberGroup = document.querySelector("#phone-number-group");
    const phoneNumberInput = phoneNumberGroup.querySelector("input");
    if (phoneNumberInput.value.length != 14 || !isValidPhoneNumber(phoneNumberInput.value)) {
        phoneNumberGroup.classList.add("invalid-format");
        valid = false;
    }

    // Validar que el correo electrónico sea valido
    const emailGroup = document.querySelector("#email-group");
    const emailInput = emailGroup.querySelector("input");
    if (!EmailValidator.validate(emailInput.value)) {
        emailGroup.classList.add("invalid-format");
        valid = false;
    }

    // Validar servicio de interés
    const serviceGroup = document.querySelector("#service-group");
    const serviceInput = serviceGroup.querySelector("input");
    if (!isValidService(serviceInput.value)) {
        serviceGroup.classList.add("invalid-format");
        valid = false;
    }

    // Validar fecha de nacimiento
    const birthdateGroup = document.querySelector("#birthdate-group");
    const birthdateInput = birthdateGroup.querySelector("input");
    if (!isValidBirthdate(birthdateInput.value)) {
        birthdateGroup.classList.add("invalid-format");
        valid = false;
    }

    // Evitar el envío del formulario si alguna validación falló
    if (!valid) {
        return;
    }

    if (isProd) {
        // Comprobar que el usuario completo el reCAPTCHA
        const recaptcha = document.querySelector('textarea[name="g-recaptcha-response"]');

        if (!recaptcha || !recaptcha.value) {
            recaptchaErrorMessage.classList.remove("hidden");
            return;
        }
        else {
            recaptchaErrorMessage.classList.add("hidden");
        }
    }

    const myForm = event.target;
    const formData = new FormData(myForm);

    const request = fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    });

    // Abrir spinner de carga
    Swal.fire({
        position: 'top',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const response = await request;

    const swalConfig = {
        position: 'top',
        customClass: {
            container: 'contact-form__swal-container',
            htmlContainer: 'contact-form__swal-htmlContainer',
            title: 'contact-form__swal-title'
        },
        showConfirmButton: false,
        timer: 3000 // 3 segundos
    }

    if (response.ok) {
        swalConfig.icon = 'success';
        swalConfig.title = '¡Gracias por tu mensaje!';
        swalConfig.text = 'Pronto te contactaré para agendar tu cita y resolver cualquier duda que tengas.';

        // Limpiar el formulario
        for (let field of fields) {
            const input = field.querySelector("input");
            input.value = "";
        }

        if (isProd) {
            // Reiniciar el reCAPTCHA
            grecaptcha.reset();
        }
    }
    else {
        swalConfig.icon = 'error';
        swalConfig.title = 'Ha ocurrido un problema.';
        swalConfig.text = 'Lamento el inconveniente, pero tu mensaje no se ha enviado. Puedes volver a intentarlo en breve o contactarme por otro canal.';
    }

    // Cerrar spinner de carga
    Swal.close();

    Swal.fire(swalConfig);
};

document.querySelector("#contact-form").addEventListener("submit", handleSubmit);