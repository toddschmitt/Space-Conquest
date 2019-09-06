var registered_modals = [];

function init_modal() {
    var btn = document.getElementById('modal_opener');
    
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

        switch(sourceName){
            case "buildShip": 
                selector = ".modal_buildShips";
                break;
            case "sendShips":
                selector = ".modal_sendShips";
                break;
        }

        var modal = document.querySelector(selector);

        modal.style.display = 'block';
        attachModalListeners(modal);
    }

    function hideAllModals() {
        var modal = document.querySelector(".modal");
        modal.style.display = 'none';
        detachModalListeners(modal);  
    }

    btn.addEventListener('click', showModal);
}