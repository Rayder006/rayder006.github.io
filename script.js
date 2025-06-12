document.addEventListener('DOMContentLoaded',()=>{
    const pageList=document.getElementById('page-list');
    const mainContent=document.getElementById('main-content');


    let visitorNameSpan;
    let nameModal;
    let nameInput;
    let closeModalButton;

    function getVisitorName(){
        if(localStorage.getItem('visitorName')){
            document.getElementById("visitor-name").style.textDecorationColor="blue";
            return localStorage.getItem('visitorName')
        }
        return 'visitante';
    }

    function setVisitorName(name){
        const trimmedName=name.trim();
        if(trimmedName === ''){
            localStorage.removeItem('visitorName');
        }else{
            localStorage.setItem('visitorName', trimmedName);
        }
        updateVisitorNameDisplay();
    }

    function updateVisitorNameDisplay(){
        if(visitorNameSpan){
            visitorNameSpan.textContent= getVisitorName();
        }
    }

    // Modal
    function openModal(){
        if(nameModal &&nameInput){
            nameModal.style.display='flex';
            nameInput.value=getVisitorName();
            nameInput.focus();
        }
    }

    function closeModal(){
        if(nameModal){
            nameModal.style.display='none';
            setVisitorName(nameInput.value);
            document.getElementById("visitor-name").style.textDecoration="none";
        }
    }

    function updateGreeting(){
        const now=new Date();
        const hour=now.getHours();
        let greetingText='';

        if(hour >= 6 && hour < 12){
            greetingText='Bom dia';
        }else if(hour >= 12 && hour < 18){
            greetingText='Boa tarde';
        }else{
            greetingText='Boa noite';
        }

        const greetingElement=document.getElementById('greeting');
        if(greetingElement){
            greetingElement.textContent=greetingText;
        }
    }

    // Renderiza o Markdown
    async function loadPage(pageFile, pageTitle){
        try{
            const response=await fetch(`./pages/${pageFile}`);
            if(!response.ok){
                throw new Error(`Erro ao carregar a página: ${response.statusText}`);
            }
            const markdownText=await response.text();
            mainContent.innerHTML=`<h2>${pageTitle}</h2>` + marked.parse(markdownText);

            if(pageFile === 'main.md'){
                visitorNameSpan=document.getElementById('visitor-name');
                nameModal=document.getElementById('name-modal');
                nameInput=document.getElementById('name-input');
                closeModalButton=document.getElementById('close-modal-button');

                if(visitorNameSpan && nameModal && nameInput && closeModalButton){
                    updateVisitorNameDisplay();
                    visitorNameSpan.addEventListener('click', openModal);
                    closeModalButton.addEventListener('click', closeModal);
                    nameInput.addEventListener('input',(e)=>{
                        setVisitorName(e.target.value);
                    });
                    nameModal.addEventListener('click',(e)=>{
                        if(e.target === nameModal){
                            closeModal();
                        }
                    });
                    document.addEventListener('keydown',(e)=>{
                        if(e.key === 'Escape' && nameModal.style.display === 'flex'){
                            closeModal();
                        }
                    });

                }else{
                    console.warn("Elementos do modal ou nome de visitante não encontrados na página 'main.md'.");
                }
            }
            updateGreeting();

        }catch(error){
            console.error("Erro ao carregar ou processar a página:", error);
            mainContent.innerHTML=`<p style="color: red;">Não foi possível carregar a página "${pageTitle}".</p>`;
        }
    }

    const pages=[
       { file: 'main.md', title: 'Página Inicial' },
       { file: 'estudos-de-algoritmos.md', title: '📘 Entendendo estruturas de dados sem morrer por dentro' },
       { file: 'curiosidades-da-ia.md', title: '🎮 Projeto GameDev 2030' },
       { file: 'curiosidades-da-ia.md', title: '📝 Anotações de aula que viraram posts' },
       { file: 'curiosidades-da-ia.md', title: '🌐 Links estranhamente úteis' },
    ];

    // Lista de Paginas na barra lateral
    pages.forEach(page =>{
        const listItem=document.createElement('li');
        const link=document.createElement('a');
        link.href=`#${page.file.replace('.md', '')}`;
        link.textContent=page.title;
        link.addEventListener('click',(e)=>{
            e.preventDefault();
            loadPage(page.file, page.title);
        });
        listItem.classList.add("list-item");
        link.classList.add("link-text");
        listItem.appendChild(link);
        pageList.appendChild(listItem);
    });

    const initialPageHash=window.location.hash.substring(1);
    const defaultPage=pages.length > 0 ? pages[0] : null;

    if(initialPageHash){
        const foundPage=pages.find(p => p.file.replace('.md', '')=== initialPageHash);
        if(foundPage){
            loadPage(foundPage.file, foundPage.title);
        }else if(defaultPage){
            loadPage(defaultPage.file, defaultPage.title);
        }
    }else if(defaultPage){
        loadPage(defaultPage.file, defaultPage.title);
    }else{
        mainContent.innerHTML='<p>Nenhuma página disponível.</p>';
    }
});