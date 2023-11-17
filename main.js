// ###################################################### //
// Caso esteja estilizando e queira pular etapas, para pular a etapa de Boas vindas descomente o código abaixo
// window.addEventListener("load", pulaBoasVindas);
// function pulaBoasVindas() {
//     let start = document.querySelector("#start-register");
//     start.click();
// }

// Para pular direto para o form 2, descomenta o código abaixo
// setCookie(
//     "fs_partial_company_id",
//     "dadosFromForm.fs_resp_cnpj",
//     7
// );

// E para voltar ao normal, comente ou apague os códigos acima e limpe a cookie usando o código abaixo
// deleteCookie("fs_partial_company_id");

// ###################################################### //

// Esconde a div de pre-register e mostra o form no lugar
jQuery("#start-register").on("click", () => {
    jQuery(".pre-register").hide();
    startRegistrationFormEvents();
    attPartnerFormEvents();
});

// Inicia os Eventos da primeira etapa do formulário
function startRegistrationFormEvents() {
    // Lógica para criar o cancelamento de eventos em caso de volta do form 2 para esse form
    let cancelEvents = document.querySelector("#cancel-events-2");
    if (cancelEvents) {
        return;
    }
    cancelEvents = document.createElement("div");
    cancelEvents.setAttribute("id", "cancel-events-2");
    jQuery("#step-1").append(cancelEvents);

    // Exibe o form
    jQuery("#registration-form").fadeIn({
        start: function () {
            jQuery(this).css({
                display: "flex",
            });
        },
    });

    // Atualiza a classe ativa da sidebar
    let step = document.querySelectorAll(".form-step");

    jQuery(window).scroll(function () {
        let scrollPos = jQuery(window).scrollTop();
        let elementOffset1 = jQuery(".step-informations:eq(0)").offset().top;
        let elementOffset2 = jQuery(".step-informations:eq(1)").offset().top;
        elementOffset1 = elementOffset1 - 300;
        elementOffset2 = elementOffset2 - 600;

        if (scrollPos >= elementOffset1 && scrollPos < elementOffset2) {
            step[1].classList.add("active");
        } else if (scrollPos >= elementOffset2) {
            step[2].classList.add("active");
        }

        if (
            scrollPos <= elementOffset1 &&
            step[1].classList.contains("active")
        ) {
            step[1].classList.remove("active");
        }
        if (
            scrollPos <= elementOffset2 &&
            step[2].classList.contains("active")
        ) {
            step[2].classList.remove("active");
        }
    });

    // Atualiza a quantidade de caracteres no campo #business-name
    jQuery("#business-name").on("input", function () {
        let currentLength = jQuery(this).val().length;
        jQuery("#business-name-count").text(`${currentLength}/200`);
    });

    // Atualiza a quantidade de caracteres no campo #shop-name
    jQuery("#shop-name").on("input", function () {
        let currentLength = jQuery(this).val().length;
        jQuery("#shop-name-count").text(`${currentLength}/200`);
    });

    // Adiciona um novo form para sócios
    let partnerFormHtml = jQuery("#partners-form").html();
    jQuery("#add-new-partner").on("click", function () {
        jQuery("#partners-form").append(partnerFormHtml);
        attPartnerFormEvents();
    });

    // Descheca uma checkbox caso a outra esteja checada
    jQuery("#ICMS").on("change", () => {
        jQuery(".radiobox-container div:eq(0)").addClass("active");
        if (jQuery("#no-ICMS").prop("checked")) {
            jQuery("#no-ICMS").prop("checked", false);
            jQuery(".radiobox-container div:eq(1)").removeClass("active");
        }
    });

    jQuery("#no-ICMS").on("change", () => {
        jQuery(".radiobox-container div:eq(1)").addClass("active");
        if (jQuery("#ICMS").prop("checked")) {
            jQuery("#ICMS").prop("checked", false);
            jQuery(".radiobox-container div:eq(0)").removeClass("active");
        }
    });

    // Envia o código de verificação por email e exibe um input para inseri-lo
    jQuery("#send-email-verification").on("click", (event) => {
        let email = document.querySelector("#fs_shop_email").value;

        $("#email-confirmation-input-container").slideDown({
            start: function () {
                jQuery(this).css({
                    display: "flex",
                });
            },
        });
        jQuery.ajax({
            type: "POST",
            url: "<?php echo admin_url('admin-ajax.php'); ?>",
            data: {
                action: "fs_send_verification_code",
                email,
            },
        });
    });

    // executa as animações de UI de transição de form e ativa os eventos do form 2
    jQuery("#step-1").on("submit", (event) => {
        event.preventDefault();

        let meuForm = document.querySelector("#step-1");
        let formData = new FormData(meuForm);

        let dadosFromForm = {};

        for (const entrada of formData.entries()) {
            let key = entrada[0];
            let value = entrada[1];
            // Armazena as informações dos múltiplos sócios
            if (key === "fs_partner-name[]") {
                dadosFromForm["fs_partner-name"] =
                    dadosFromForm["fs_partner-name"] || [];

                dadosFromForm["fs_partner-name"].push(value);
            } else if (key === "fs_resp_ssn[]") {
                dadosFromForm["fs_resp_ssn"] =
                    dadosFromForm["fs_resp_ssn"] || [];

                dadosFromForm["fs_resp_ssn"].push(value);
            } else if (key === "fs_nationality[]") {
                dadosFromForm["fs_nationality"] =
                    dadosFromForm["fs_nationality"] || [];

                dadosFromForm["fs_nationality"].push(value);
            } else if (key === "fs_dob[]") {
                dadosFromForm["fs_dob"] = dadosFromForm["fs_dob"] || [];

                dadosFromForm["fs_dob"].push(value);
            } else if (key === "fs_partner_address[]") {
                dadosFromForm["fs_partner_address"] =
                    dadosFromForm["fs_partner_address"] || [];

                dadosFromForm["fs_partner_address"].push(value);
            } else {
                dadosFromForm[key] = value;
            }
        }

        dadosFromForm["partial_step"] = 1;
        // Envia os dados para o backend
        jQuery.ajax({
            type: "POST",
            url: "<?php echo admin_url('admin-ajax.php'); ?>",
            data: dadosFromForm,
            success: function (response) {
                if (response.success) {
                    // Manipula a UI
                    jQuery("#step-1").hide();
                    jQuery(".register-step:eq(1)").addClass("active");
                    jQuery(".middle-line").addClass("active");
                    jQuery("#step-2").fadeIn();
                    setTimeout(() => {
                        jQuery(".form-step.active").removeClass("active");
                        jQuery(".form-step:eq(3)").addClass("active");
                        startFinalizationFormEvents();
                    }, 100);

                    // Cria a cookie que permite o usuario voltar depois e já continuar de onde parou
                    setCookie(
                        "fs_partial_company_id",
                        dadosFromForm.fs_resp_cnpj,
                        7
                    );
                }
            },
            error: function (textStatus, errorThrown) {
                // Em caso de erro na validação de e-mail, modifica a UI
                if (textStatus === "Error in e-mail validation") {
                    let html = `<div class="input-count" id="email_verification_svg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"><path fill="red" fill-rule="evenodd" d="M8.6 1c1.6.1 3.1.9 4.2 2c1.3 1.4 2 3.1 2 5.1c0 1.6-.6 3.1-1.6 4.4c-1 1.2-2.4 2.1-4 2.4c-1.6.3-3.2.1-4.6-.7c-1.4-.8-2.5-2-3.1-3.5C.9 9.2.8 7.5 1.3 6c.5-1.6 1.4-2.9 2.8-3.8C5.4 1.3 7 .9 8.6 1zm.5 12.9c1.3-.3 2.5-1 3.4-2.1c.8-1.1 1.3-2.4 1.2-3.8c0-1.6-.6-3.2-1.7-4.3c-1-1-2.2-1.6-3.6-1.7c-1.3-.1-2.7.2-3.8 1c-1.1.8-1.9 1.9-2.3 3.3c-.4 1.3-.4 2.7.2 4c.6 1.3 1.5 2.3 2.7 3c1.2.7 2.6.9 3.9.6zM7.9 7.5L10.3 5l.7.7l-2.4 2.5l2.4 2.5l-.7.7l-2.4-2.5l-2.4 2.5l-.7-.7l2.4-2.5l-2.4-2.5l.7-.7l2.4 2.5z" clip-rule="evenodd"/></svg>
                    </div>`;
                    jQuery("#email-confirmation-input-container").append(html);
                }
            },
        });
    });
}

// Aciona os eventos nos campos posteriormente inseridos pelo botão de |"Adicionar outro sócio"|
function attPartnerFormEvents() {
    let partnerForms = document.querySelectorAll("#partner-name");
    let partnerNameCount = document.querySelectorAll("#partner-name-count");
    partnerForms.forEach((element, index) => {
        element.addEventListener("input", () => {
            let currentLength = element.value.length;
            partnerNameCount[index].innerHTML = `${currentLength}/60`;
        });
    });

    jQuery(".cpf").on("input", function () {
        jQuery(this).val(mascaraCPF(jQuery(this).val()));

        let cpf = jQuery(this).val();

        if (cpf.length == 14 && !validarCPF(cpf)) {
            jQuery(this).css({
                outline: "2px solid red",
            });
            jQuery("#send").attr("disabled", "disabled"); // botão de enviar é desabilitado
            return;
        }

        jQuery(this).removeAttr("style");
        jQuery("#send").removeAttr("disabled"); // remove o disabled do botão de enviar
    });
}

// Funções que manipulam a cookie

function setCookie(nome, valor, diasParaExpirar) {
    var dataExpiracao = new Date();
    dataExpiracao.setTime(
        dataExpiracao.getTime() + diasParaExpirar * 24 * 60 * 60 * 1000
    );
    var expires = "expires=" + dataExpiracao.toUTCString();
    document.cookie = nome + "=" + valor + "; " + expires + "; path=/";
}

function getCookie(nome) {
    var nomeC = nome + "=";
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        while (cookie.charAt(0) == " ") {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(nomeC) == 0) {
            return cookie.substring(nomeC.length, cookie.length);
        }
    }
    return "";
}

function deleteCookie(nome) {
    document.cookie = nome + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
}

function verificarCookie() {
    var cookieValor = getCookie("fs_partial_company_id");
    if (cookieValor !== "") {
        jQuery(".pre-register").hide();
        jQuery("#step-1").hide();
        jQuery("#back").hide();
        jQuery("#registration-form").fadeIn({
            start: function () {
                jQuery(this).css({
                    display: "flex",
                });
            },
        });
        jQuery(".register-step:eq(1)").addClass("active");
        jQuery(".middle-line").addClass("active");
        jQuery("#step-2").fadeIn();
        jQuery(".form-step:eq(0)").removeClass("active");
        jQuery(".form-step:eq(3)").addClass("active");
        startFinalizationFormEvents();
    }
}

window.onload = verificarCookie;

// Validações e máscaras dos inputs do primeiro form

function validarCNPJ(cnpj) {
    var b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    var c = String(cnpj).replace(/[^\d]/g, "");

    if (c.length !== 14) return false;

    if (/0{14}/.test(c)) return false;

    for (var i = 0, n = 0; i < 12; n += c[i] * b[++i]);
    if (c[12] != ((n %= 11) < 2 ? 0 : 11 - n)) return false;

    for (var i = 0, n = 0; i <= 12; n += c[i] * b[i++]);
    if (c[13] != ((n %= 11) < 2 ? 0 : 11 - n)) return false;

    return true;
}

jQuery(function ($) {
    function getCEPDataBrasilAPI(cep) {
        return new Promise((resolve, reject) => {
            jQuery.ajax({
                url: "https://brasilapi.com.br/api/cep/v1/" + cep,
                async: true,
                method: "get",
                success: function (success) {
                    if ("service" in success) {
                        resolve(success);
                    } else {
                        reject(false);
                    }
                },
                error: function (error) {
                    reject(error);
                },
            });
        });
    }

    jQuery("#CEP").on("input", function (e) {
        jQuery(this).val(mascaraCep(jQuery(this).val()));

        let cep = jQuery(this).val();

        if (cep.length == 9) {
            const fieldMapping = {
                street: "#fs_adress_street",
                neighborhood: "#fs_adress_neighbourhood",
                city: "#fs_adress_city",
                state: "#fs_adress_state",
            };

            getCEPDataBrasilAPI(cep).then((data) => {
                // console.log(data);
                if (data) {
                    Object.entries(fieldMapping).forEach(([key, selector]) => {
                        if (key in data) {
                            jQuery(selector).val(data[key]);
                        }
                    });
                }
            });
        }
    });
});

function getCNPJDataBrasilAPi(cnpj) {
    let url = "https://brasilapi.com.br/api/cnpj/v1/" + cnpj;
    console.log(url);
    return new Promise((resolve, reject) => {
        jQuery.ajax({
            url: url,
            async: true,
            method: "get",
            success: function (success) {
                if (success) {
                    resolve(success);
                } else {
                    reject(false);
                }
            },
            error: function (error) {
                reject(error);
            },
        });
    });
}

function extrairNumeros(str) {
    return str.replace(/[^0-9]/g, "");
}

jQuery("#cnpj").on("input", function () {
    jQuery(this).val(mascaraCNPJ(jQuery(this).val()));

    let cnpj = jQuery(this).val();

    if (cnpj.length == 18) {
        if (!validarCNPJ(cnpj)) {
            jQuery(this).css({
                outline: "2px solid red",
            });
            jQuery("#send").attr("disabled", "disabled"); // botão de enviar é desabilitado
            return;
        }

        const fieldMapping = {
            razao_social: "#business-name",
            cep: "#CEP",
            numero: "#fs_adress_number",
            complemento: "#fs_adress_apartment",
        };

        cnpj = Number(extrairNumeros(cnpj));

        getCNPJDataBrasilAPi(cnpj).then((data) => {
            if (data) {
                Object.entries(fieldMapping).forEach(([key, selector]) => {
                    if (key in data) {
                        jQuery(selector).val(data[key]);
                        if (key === "cep") {
                            jQuery(selector).trigger("input");
                        } else if (key === "razao_social") {
                            jQuery(selector).trigger("input");
                        }
                    }
                });
            }
        });
    }

    jQuery(this).removeAttr("style");
    jQuery("#send").removeAttr("disabled"); // remove o disabled do botão de enviar
});

function mascaraCNPJ(v) {
    v = v.replace(/\D/g, ""); //Remove tudo o que não é dígito
    v = v.replace(/^(\d{2})(\d)/, "$1.$2"); //Coloca ponto entre o segundo e o terceiro dígitos
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3"); //Coloca ponto entre o quinto e o sexto dígitos
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2"); //Coloca uma barra entre o oitavo e o nono dígitos
    v = v.replace(/(\d{4})(\d)/, "$1-$2"); //Coloca um hífen depois do bloco de quatro dígitos
    return v;
}

function mascaraCep(value) {
    if (!value) return "";
    value = value.replace(/\D/g, "");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
}

function mascaraCPF(v) {
    v = v.replace(/\D/g, ""); //Remove tudo o que não é dígito
    v = v.replace(/(\d{3})(\d)/, "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
    v = v.replace(/(\d{3})(\d)/, "$1.$2"); //Coloca um ponto entre o terceiro e o quarto dígitos
    //de novo (para o segundo bloco de números)
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); //Coloca um hífen entre o terceiro e o quarto dígitos
    return v;
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf == "") return false;
    // Elimina CPFs invalidos conhecidos
    if (
        cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999"
    )
        return false;
    // Valida 1o digito
    add = 0;
    for (i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(9))) return false;
    // Valida 2o digito
    add = 0;
    for (i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(cpf.charAt(10))) return false;
    return true;
}

function mTel(v) {
    var r = v.replace(/\D/g, "");
    r = r.replace(/^0/, "");
    if (r.length > 10) {
        r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (r.length > 5) {
        r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (r.length > 2) {
        r = r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
    } else {
        r = r.replace(/^(\d*)/, "($1");
    }
    return r;
}

jQuery("#tel").on("input", function () {
    jQuery(this).val(mTel(jQuery(this).val()));

    let tel = jQuery(this).val();

    if (tel.length == 18) {
        jQuery(this).css({
            outline: "2px solid red",
        });
        jQuery("#send").attr("disabled", "disabled"); // botão de enviar é desabilitado
        return;
    }

    jQuery(this).removeAttr("style");
    jQuery("#send").removeAttr("disabled"); // remove o disabled do botão de enviar
});

// ativa os eventos do form 2
function startFinalizationFormEvents() {
    let pdf, rgFrente, rgVerso, selfie;
    // Lógica para não duplicar os eventos caso haja uma volta para o form 1 e outro avanço para o form 2
    let cancelEvents = document.querySelector("#cancel-events");
    if (cancelEvents) {
        return;
    }
    cancelEvents = document.createElement("div");
    cancelEvents.setAttribute("id", "cancel-events");
    jQuery("#step-2").append(cancelEvents);

    // Botão para voltar para o form anterior
    jQuery("#back").on("click", () => {
        jQuery("#step-2").hide();
        jQuery("#step-1").fadeIn();
        jQuery(".register-step:eq(1)").removeClass("active");

        jQuery(".middle-line").removeClass("active");
        jQuery(".middle-line").addClass("inactive");
        setTimeout(() => {
            jQuery(".middle-line").removeClass("inactive");
        }, 400);
        jQuery(".form-step:eq(0)").addClass("active");
        jQuery(".form-step:eq(3)").removeClass("active");
        startRegistrationFormEvents();
    });

    let dropZone = document.querySelector("#pdf-drop-zone");
    let imageInput = document.querySelector("#pdf-image-input");
    let imagePreview = document.querySelector("#pdf-image-preview");
    let removeImage = document.querySelector("#pdf-remove-image");

    // Muda a cor da div quando arrastamos algo por cima dela
    dropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        this.style.backgroundColor = "#f0f0f0";
    });
    // Volta a cor original
    dropZone.addEventListener("dragleave", function () {
        this.style.backgroundColor = "";
    });
    // Quando arrastamos e soltamos a imagem na div começamos o evento
    dropZone.addEventListener("drop", function (e) {
        e.preventDefault();
        this.style.backgroundColor = "";

        const file = e.dataTransfer.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const imageData = event.target.result; // Imagem em base64
                pdf = imageData;

                let image = document.createElement("img");

                image.setAttribute(
                    "src",
                    "https://feiracitymarketplace.com.br/wp-content/uploads/2023/11/PDF-1.png"
                );
                imagePreview.innerHTML = "";
                imagePreview.appendChild(image);

                const imageName = file.name;
            };

            reader.readAsDataURL(file);
            removeImage.style.display = "flex";
        }
    });

    imageInput.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const imageData = event.target.result; // Imagem em base64
                pdf = imageData;

                let image = document.createElement("img");

                image.setAttribute(
                    "src",
                    "https://feiracitymarketplace.com.br/wp-content/uploads/2023/11/PDF-1.png"
                );
                imagePreview.innerHTML = "";
                imagePreview.appendChild(image);

                const imageName = file.name;
            };

            reader.readAsDataURL(file);
            removeImage.style.display = "flex";
        }
    });

    // Evento ativado ao clicar no botão 'Remover Imagem'
    removeImage.addEventListener("click", () => {
        imagePreview.innerHTML = "";
        removeImage.style.display = "none";
        pdf = "";
    });

    let dropZone2 = document.querySelector("#drop-zone");
    let imageInput2 = document.querySelector("#image-input");
    let imagePreview2 = document.querySelector("#image-preview");
    let removeImage2 = document.querySelector("#remove-image");

    dropZone2.addEventListener("dragover", function (e) {
        e.preventDefault();
        this.style.backgroundColor = "#f0f0f0";
    });
    dropZone2.addEventListener("dragleave", function () {
        this.style.backgroundColor = "";
    });

    dropZone2.addEventListener("drop", function (e) {
        e.preventDefault();
        this.style.backgroundColor = "";

        const file = e.dataTransfer.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const imageData = event.target.result; // Imagem em base64
                rgFrente = imageData;
                const image = new Image();

                image.src = imageData;
                imagePreview2.innerHTML = "";
                imagePreview2.appendChild(image);

                const imageName = file.name;
            };

            reader.readAsDataURL(file);
            removeImage2.style.display = "flex";
        }
    });

    imageInput2.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const imageData = event.target.result; // Imagem em base64
                const image = new Image();
                rgFrente = imageData;

                image.src = imageData;
                imagePreview2.innerHTML = "";
                imagePreview2.appendChild(image);

                const imageName = file.name;
            };

            reader.readAsDataURL(file);
            removeImage2.style.display = "flex";
        }
    });

    removeImage2.addEventListener("click", () => {
        imagePreview2.innerHTML = "";
        removeImage2.style.display = "none";
        rgFrente = "";
    });

    let dropZone3 = document.querySelector("#drop-zone-2");
    let imageInput3 = document.querySelector("#image-input-2");
    let imagePreview3 = document.querySelector("#image-preview-2");
    let removeImage3 = document.querySelector("#remove-image-2");

    dropZone3.addEventListener("dragover", function (e) {
        e.preventDefault();
        this.style.backgroundColor = "#f0f0f0";
    });
    dropZone3.addEventListener("dragleave", function () {
        this.style.backgroundColor = "";
    });
    dropZone3.addEventListener("drop", function (e) {
        e.preventDefault();
        this.style.backgroundColor = "";

        const file = e.dataTransfer.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const imageData = event.target.result; // Imagem em base64
                rgVerso = imageData;
                const image = new Image();

                image.src = imageData;
                imagePreview3.innerHTML = "";
                imagePreview3.appendChild(image);

                const imageName = file.name;
            };

            reader.readAsDataURL(file);
            removeImage3.style.display = "flex";
        }
    });

    imageInput3.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const imageData = event.target.result; // Imagem em base64
                const image = new Image();
                rgVerso = imageData;

                image.src = imageData;
                imagePreview3.innerHTML = "";
                imagePreview3.appendChild(image);

                const imageName = file.name;
            };

            reader.readAsDataURL(file);
            removeImage3.style.display = "flex";
        }
    });

    removeImage3.addEventListener("click", () => {
        imagePreview3.innerHTML = "";
        removeImage3.style.display = "none";
        rgVerso = "";
    });

    let dropZone4 = document.querySelector("#drop-zone-3");
    let imageInput4 = document.querySelector("#image-input-3");
    let imagePreview4 = document.querySelector("#image-preview-3");
    let removeImage4 = document.querySelector("#remove-image-3");

    dropZone4.addEventListener("dragover", function (e) {
        e.preventDefault();
        this.style.backgroundColor = "#f0f0f0";
    });
    dropZone4.addEventListener("dragleave", function () {
        this.style.backgroundColor = "";
    });
    dropZone4.addEventListener("drop", function (e) {
        e.preventDefault();
        this.style.backgroundColor = "";

        const file = e.dataTransfer.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const imageData = event.target.result; // Imagem em base64
                const image = new Image();
                selfie = imageData;
                image.src = imageData;
                imagePreview4.innerHTML = "";
                imagePreview4.appendChild(image);

                const imageName = file.name;
            };

            reader.readAsDataURL(file);
            removeImage4.style.display = "flex";
        }
    });

    imageInput4.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (event) {
                const imageData = event.target.result; // Imagem em base64
                const image = new Image();
                selfie = imageData;

                image.src = imageData;
                imagePreview4.innerHTML = "";
                imagePreview4.appendChild(image);

                const imageName = file.name;
            };

            reader.readAsDataURL(file);
            removeImage4.style.display = "flex";
        }
    });

    removeImage4.addEventListener("click", () => {
        imagePreview4.innerHTML = "";
        removeImage4.style.display = "none";
        selfie = "";
    });

    jQuery("#step-2").on("submit", (event) => {
        event.preventDefault();
        let nonce = document.querySelector("#nonce").value;

        let dadosFromForm = {
            fs_resp_nonce: nonce,
            fs_social_contract: pdf,
            fs_identification_front: rgFrente,
            fs_identification_back: rgVerso,
            fs_selfie: selfie,
            action: "fs_save_form_submission",
            partial_step: 2,
        };

        console.log(dadosFromForm);

        jQuery.ajax({
            type: "POST",
            url: "<?php echo admin_url('admin-ajax.php'); ?>",
            data: dadosFromForm,
            success: function (response) {
                if (response.success) {
                    deleteCookie("fs_partial_company_id");
                    setTimeout(() => {
                        window.location.href =
                            "https://feiracitymarketplace.com.br/cadastro-concluido/";
                    }, 3000);
                }
            },
        });
    });
}
