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

    // Validar que el número de contacto este completo
    const phoneNumberGroup = document.querySelector("#phone-number-group");
    const phoneNumberInput = phoneNumberGroup.querySelector("input");
    if (phoneNumberInput.value.length != 14) {
        phoneNumberGroup.classList.add("invalid-format");
        return;
    }

    // Validar que el correo electrónico sea valido
    const emailGroup = document.querySelector("#email-group");
    const emailInput = emailGroup.querySelector("input");
    if (!EmailValidator.validate(emailInput.value)) {
        emailGroup.classList.add("invalid-format");
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