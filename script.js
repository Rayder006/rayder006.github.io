document.addEventListener('DOMContentLoaded',()=>{
    const pageList = document.getElementById('page-list');
    const mainContent = document.getElementById('main-content');

    // Variáveis para o Modal de Nome(Apelido)
    let visitorNameSpan;
    let nameModal;
    let nameInput;
    let closeModalButton;

    // Variáveis para o Seletor de Tema
    const themeSwitcherWrapper = document.querySelector('.theme-switcher-wrapper');
    const themeOptionsModal = document.getElementById('theme-options-modal'); // Referência ao modal de opções
    const themeOptionButtons = document.querySelectorAll('.theme-option');
    // const closeThemeModalButton = document.getElementById('close-theme-modal-button'); // Botão "Fechar" não está mais no HTML fornecido

    // Funções para manipulação do nome do visitante
    function getVisitorName(){
        if(localStorage.getItem('visitorName')){
            return localStorage.getItem('visitorName');
        }
        return 'visitante';
    }

    function setVisitorName(name){
        const trimmedName = name.trim();
        if(trimmedName === ''){
            localStorage.removeItem('visitorName');
        }else{
            localStorage.setItem('visitorName', trimmedName);
        }
        updateVisitorNameDisplay();
    }

    function updateVisitorNameDisplay(){
        if(visitorNameSpan){
            visitorNameSpan.textContent = getVisitorName();
            // Mantendo as cores hard-coded como solicitado
            if(localStorage.getItem('visitorName')!= "visitante"){
                visitorNameSpan.style.textDecorationColor = "blue";
                visitorNameSpan.style.textDecoration = "underline wavy blue";
            }else{
                visitorNameSpan.style.textDecorationColor = "red";
                visitorNameSpan.style.textDecoration = "underline wavy red";
            }
        }
    }

    // Funções do Modal de Nome(Apelido)
    function openNameModal(){
        if(nameModal && nameInput){
            nameModal.style.display = 'flex';
            nameInput.value = getVisitorName();
            nameInput.focus();
        }
    }

    function closeNameModal(){
        if(nameModal){
            nameModal.style.display = 'none';
            setVisitorName(nameInput.value);
        }
    }

    // Funções de Tema
    function applyTheme(themeName){
        document.getElementById("themeIcon").remove();
        let switcherBtn = document.getElementById("theme-switcher-button");
        let themeIcon = document.createElement('i');
        themeIcon.id = "themeIcon";
        themeIcon.classList.add('fa-solid');
        if(themeName=="light"){
            themeIcon.classList.add('fa-sun');
        }
        else if(themeName=="dark"){
            themeIcon.classList.add('fa-moon');
        }
        else if(themeName=="monokai"){
            themeIcon.classList.add('fa-m');
        }
        else if(themeName=="matrix"){
            themeIcon.classList.add('fa-code');
        }

        switcherBtn.appendChild(themeIcon);

        document.body.classList.add('no-transition');

        document.body.className = document.body.className.split(' ').filter(c => !c.startsWith('theme-')&& c !== 'no-transition').join(' ');

        if(themeName !== 'light'){
            document.body.classList.add(`theme-${themeName}`);
        }
        localStorage.setItem('selectedTheme', themeName);

        setTimeout(()=>{
            document.body.classList.remove('no-transition');
        }, 10);
    }

    function loadSavedTheme(){
        const savedTheme = localStorage.getItem('selectedTheme')|| 'light';
        applyTheme(savedTheme);
    }

    // Função para fechar o modal de tema(ocultar visualmente)
    // Definida como const para garantir o escopo correto
    const closeThemeModalVisual =()=>{
        if(themeOptionsModal){ // Usa a constante themeOptionsModal do escopo superior
            themeOptionsModal.style.opacity = '0';
            themeOptionsModal.style.transform = 'translateY(100%)';
            themeOptionsModal.style.visibility = 'hidden';
        }
    };

    const openThemeModalVisual =()=>{
        if(themeOptionsModal){ // Usa a constante themeOptionsModal do escopo superior
            themeOptionsModal.style.opacity = '100';
            themeOptionsModal.style.visibility = 'visible';
            themeOptionsModal.style.transform = 'translateX(-102%)';
        }
    };


    // Função para atualizar a saudação de Bom dia/tarde/noite
    function updateGreeting(){
        const now = new Date();
        const hour = now.getHours();
        let greetingText = '';

        if(hour >= 6 && hour < 12){ // 6 AM a 11:59 AM
            greetingText = 'Bom dia';
        }else if(hour >= 12 && hour < 18){ // 12 PM a 5:59 PM
            greetingText = 'Boa tarde';
        }else{ // 6 PM a 5:59 AM
            greetingText = 'Boa noite';
        }

        const greetingElement = document.getElementById('greeting');
        if(greetingElement){
            greetingElement.textContent = greetingText;
        }
    }

    // Função para carregar e renderizar o conteúdo Markdown
    async function loadPage(pageFile, pageTitle){
        try{
            const response = await fetch(`./pages/${pageFile}`);
            if (!response.ok) {
                throw new Error(`Erro ao carregar a página: ${response.statusText}`);
            }
            const markdownText = await response.text();
            mainContent.innerHTML = `<h2>${pageTitle}</h2>` + marked.parse(markdownText);

            if (window.MathJax) { 
                MathJax.typesetPromise([mainContent]) 
                    .catch((err) => console.error('MathJax rendering failed:', err));
            }

            if(pageFile === 'main.md'){
                visitorNameSpan = document.getElementById('visitor-name');
                nameModal = document.getElementById('name-modal');
                nameInput = document.getElementById('name-input');
                closeModalButton = document.getElementById('close-modal-button');

                if(visitorNameSpan && nameModal && nameInput && closeModalButton){
                    updateVisitorNameDisplay();
                    visitorNameSpan.addEventListener('click', openNameModal);
                    closeModalButton.addEventListener('click', closeNameModal);
                    nameInput.addEventListener('input',(e)=>{
                        setVisitorName(e.target.value);
                    });

                    nameModal.addEventListener('click',(e)=>{
                        if(e.target === nameModal){
                            closeNameModal();
                        }
                    });

                    document.addEventListener('keydown',(e)=>{
                        if(e.key === 'Escape' && nameModal.style.display === 'flex'){
                            closeNameModal();
                        }
                    });
                }else{
                    console.warn("Elementos do modal ou nome de visitante não encontrados na página 'main.md'.");
                }
            }
            updateGreeting();

        }catch(error){
            console.error("Erro ao carregar ou processar a página:", error);
            mainContent.innerHTML = `<p style="color: red;">Não foi possível carregar a página "${pageTitle}".</p>`;
        }
    }

    const pages = [
       { file: 'main.md', title: 'Página Inicial' },
       { file: 'algo.md', title: '📘 Entendendo estruturas de dados sem morrer por dentro' },
       { file: 'game.md', title: '🎮 Projeto GameDev 2030' },
       { file: 'aula.md', title: '📝 Anotações de aula que viraram posts' },
       { file: 'link.md', title: '🌐 Links estranhamente úteis' },
    ];

    // Inicialização e Event Listeners Globais

    loadSavedTheme();

    // Adiciona o event listener para fechar o modal de tema quando o mouse sair do wrapper
    if(themeSwitcherWrapper){
        themeSwitcherWrapper.addEventListener('mouseover', openThemeModalVisual);
        themeSwitcherWrapper.addEventListener('mouseleave', closeThemeModalVisual);
    }

    themeOptionButtons.forEach(button =>{
        button.addEventListener('click',()=>{
            const theme = button.dataset.theme;
            applyTheme(theme);
            closeThemeModalVisual(); // Fechar o modal após selecionar um tema
        });
    });

    document.addEventListener('keydown',(e)=>{
        if(e.key === 'Escape' && themeOptionsModal && themeOptionsModal.style.opacity === '1'){
            closeThemeModalVisual();
        }
    });

    // Gerar a lista de páginas na barra lateral
    pages.forEach(page =>{
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${page.file.replace('.md', '')}`;
        link.textContent = page.title;
        link.addEventListener('click',(e)=>{
            e.preventDefault();
            loadPage(page.file, page.title);
        });
        listItem.classList.add("list-item");
        link.classList.add("link-text");
        listItem.appendChild(link);
        pageList.appendChild(listItem);
    });

    const initialPageHash = window.location.hash.substring(1);
    const defaultPage = pages.length > 0 ? pages[0] : null;

    if(initialPageHash){
        const foundPage = pages.find(p => p.file.replace('.md', '')=== initialPageHash);
        if(foundPage){
            loadPage(foundPage.file, foundPage.title);
        }else if(defaultPage){
            loadPage(defaultPage.file, defaultPage.title);
        }
    }else if(defaultPage){
        loadPage(defaultPage.file, defaultPage.title);
    }else{
        mainContent.innerHTML = '<p>Nenhuma página disponível.</p>';
    }
});