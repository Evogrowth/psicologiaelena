    document.querySelectorAll("button[name='navigation']").forEach(button => {
        button.addEventListener("click", () => {
            const targetElement = document.querySelector(`#${button.getAttribute("data-target-id")}`);

            if(targetElement != null){
                scrollTo({
                    top: targetElement.getBoundingClientRect().top + (window.pageYOffset - document.getElementById("navBar").offsetHeight),
                    behavior: "smooth"
                });
            }
        })
    });