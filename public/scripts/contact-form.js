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

    for (let field of fields) {
        const input = field.querySelector("input");

        if (!input.value) {
            field.classList.add("invalid");
            valid = false;
        }
    }

    if (!valid) {
        return;
    }

    const phoneNumberGroup = document.querySelector("#phone-number-group");

    const phoneNumberInput = phoneNumberGroup.querySelector("input");

    if (phoneNumberInput.value.length != 14) {
        phoneNumberGroup.classList.add("invalid-format");
        return;
    }

    const myForm = event.target;
    const formData = new FormData(myForm);

    const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
    })

    if (!response.ok) {
        alert("Un error inesperado ha ocurrido...");
        return;
    }

    alert("Formulario enviado exitosamente");
};

document.querySelector("#contact-form").addEventListener("submit", handleSubmit);