var MODAL_MODULE = (function () {
    var modal_module = {};
    var registered_modals = [];
    var current_open_modal_selector = null;
    var current_open_modal_instance = null;

    function attachModalListeners(modalElm) {
        modalElm.querySelector('.close_modal').addEventListener('click', hideAllModals);
        modalElm.querySelector('.overlay').addEventListener('click', hideAllModals);
    }

    function detachModalListeners(modalElm) {
        modalElm.querySelector('.close_modal').removeEventListener('click', hideAllModals);
        modalElm.querySelector('.overlay').removeEventListener('click', hideAllModals);
    }

    function showModal(e) {
        var sourceName = e.srcElement.name;
        var selector;
        current_open_modal_instance = registered_modals.filter((m) => m.elementName === sourceName)[0];
        selector = current_open_modal_instance.selector;

        var modal = document.querySelector(selector);
        current_open_modal_selector = modal;

        modal.style.display = 'block';

        attachModalListeners(modal);
        current_open_modal_instance.onOpen();
    }

    function hideAllModals() {
        current_open_modal_selector.style.display = 'none';
        detachModalListeners(current_open_modal_selector);
        current_open_modal_selector = null;
        current_open_modal_instance.onClose();
        current_open_modal_instance = null;
    }



    //Public Section
    function register_modal(elementName, selector, onOpen, onClose) {
        registered_modals.push({
            'elementName': elementName,
            'selector': selector,
            'onOpen': onOpen,
            'onClose': onClose
        });
    }

    function init_modal() {
        var btn = document.getElementsByClassName('modal_opener');

        [...btn].forEach(element => {
            element.addEventListener('click', showModal);
        });
    }

    modal_module.init_modal = init_modal;
    modal_module.register_modal = register_modal;
    return modal_module;
}());