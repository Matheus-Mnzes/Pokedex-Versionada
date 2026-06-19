let pokemonAtual = null;
let listaPokemon = [];

function abrirAba(id, btn){

    document
        .querySelectorAll(".tab-content")
        .forEach(el =>
            el.classList.remove("active-content")
        );

    document
        .querySelectorAll(".tab")
        .forEach(el =>
            el.classList.remove("active")
        );

    document
        .getElementById(id)
        .classList.add("active-content");

    btn.classList.add("active");
}

function abrirPokemonAba(id, btn){

    document
        .querySelectorAll(".pokemon-content")
        .forEach(el =>
            el.classList.remove("active-pokemon-content")
        );

    document
        .querySelectorAll(".pokemon-tab")
        .forEach(el =>
            el.classList.remove("active")
        );

    document
        .getElementById(id)
        .classList.add("active-pokemon-content");

    btn.classList.add("active");
}


function toggleTheme(){

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "tema",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );
}

function carregarTema(){

    if(localStorage.getItem("tema")==="dark"){
        document.body.classList.add("dark");
    }
}

async function buscarPokemon(){

    const input =
        document.getElementById("pokemonInput")
        .value
        .trim()
        .toLowerCase();

    if(!input) return;

    try{

        const response =
            await fetch(
                `https://pokeapi.co/api/v2/pokemon/${input}`
            );

        if(!response.ok){
            throw new Error();
        }

        const data =
            await response.json();

        pokemonAtual = {
            id:data.id,
            name:data.name,
            image:data.sprites.other["official-artwork"].front_default,
            sprite: data.sprites.front_default
        };

        document.getElementById("pokemonCard")
            .style.display="block";

        document.getElementById("pokemonImage")
            .src = pokemonAtual.image;

        document.getElementById("pokemonName")
            .textContent = data.name;

        document.getElementById("pokemonId")
            .textContent = data.id;

        document.getElementById("pokemonHeight")
            .textContent = data.height/10;

        document.getElementById("pokemonWeight")
            .textContent = data.weight/10;

        carregarEvolucao(data.id);

        document.getElementById("error")
            .textContent = "";

        document.getElementById("spriteNormal")
            .src = data.sprites.front_default; 
        
        document.getElementById("spriteShiny")
            .src = data.sprites.front_shiny;

        const types =
            document.getElementById("pokemonTypes");

        types.innerHTML="";

        data.types.forEach(type=>{

            const coresTipos = {
            normal: "#A8A77A",
            fire: "#EE8130",
            water: "#6390F0",
            electric: "#F7D02C",
            grass: "#7AC74C",
            ice: "#96D9D6",
            fighting: "#C22E28",
            poison: "#A33EA1",
            ground: "#E2BF65",
            flying: "#A98FF3",
            psychic: "#F95587",
            bug: "#A6B91A",
            rock: "#B6A136",
            ghost: "#735797",
            dragon: "#6F35FC",
            dark: "#705746",
            steel: "#B7B7CE",
            fairy: "#D685AD"
        };

            types.innerHTML += `
                <span class="type"
                style="background:${coresTipos[type.type.name] || '#777'}">
                ${type.type.name}
            </span>
            `;

        });

        const stats =
            document.getElementById("statsContainer");

        stats.innerHTML="";

        data.stats.forEach(stat=>{

            const valor =
                Math.min(stat.base_stat,100);

            stats.innerHTML += `
                <div class="stat">

                    <div class="stat-label">
                        ${stat.stat.name.toUpperCase()}
                        (${stat.base_stat})
                    </div>

                    <div class="stat-bar">
                        <div
                            class="stat-fill"
                            style="width:${valor}%">
                        </div>
                    </div>

                </div>
            `;
        });

    }catch{

        document.getElementById("error")
            .textContent =
            "Pokémon não encontrado.";

        document.getElementById("pokemonCard")
            .style.display="none";
    }
}

function favoritarPokemon(){

    if(!pokemonAtual) return;

    let favoritos =
        JSON.parse(
            localStorage.getItem("favoritos")
        ) || [];

    if(
        favoritos.some(
            p=>p.id===pokemonAtual.id
        )
    ){
        alert("Pokémon já favoritado!");
        return;
    }else{
        alert("Pokémon favoritado ⭐");
    }

    favoritos.push(pokemonAtual);

    localStorage.setItem(
        "favoritos",
        JSON.stringify(favoritos)
    );

    renderizarFavoritos();
}

function removerFavorito(id){

    let favoritos =
        JSON.parse(
            localStorage.getItem("favoritos")
        ) || [];

    favoritos =
        favoritos.filter(
            p=>p.id!==id
        );

    localStorage.setItem(
        "favoritos",
        JSON.stringify(favoritos)
    );

    renderizarFavoritos();
}

function renderizarFavoritos(){

    const lista =
        document.getElementById("favoritesList");

    const favoritos =
        JSON.parse(
            localStorage.getItem("favoritos")
        ) || [];

    lista.innerHTML="";

    if(favoritos.length===0){

        lista.innerHTML =
            "<p>Nenhum Pokémon favoritado.</p>";

        return;
    }

    favoritos.forEach(pokemon=>{

        lista.innerHTML += `
            <div class="favorite-item">

                <div class="favorite-info">
                    <img src="${pokemon.sprite}">
                    <strong>
                        #${pokemon.id}
                        ${pokemon.name}
                    </strong>
                </div>

                <button
                    class="remove-btn"
                    onclick="removerFavorito(${pokemon.id})">
                    Remover
                </button>

            </div>
        `;
    });
}

async function carregarEvolucao(pokemonId){

    const evolutionDiv =
        document.getElementById(
            "evolutionChain"
        );

    evolutionDiv.innerHTML =
        "Carregando...";

    try{

        const pokemonResponse =
            await fetch(
                `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
            );

        const species =
            await pokemonResponse.json();

        const evolutionResponse =
            await fetch(
                species.evolution_chain.url
            );

        const evolutionData =
            await evolutionResponse.json();

        const evolucoes = [];

        let atual =
            evolutionData.chain;

        while(atual){

            evolucoes.push(
                atual.species.name
            );

            atual =
                atual.evolves_to[0];
        }

        evolutionDiv.innerHTML = "";

        for(let i=0;i<evolucoes.length;i++){

            const nome =
                evolucoes[i];

            const response =
                await fetch(
                    `https://pokeapi.co/api/v2/pokemon/${nome}`
                );

            const pokemon =
                await response.json();

            evolutionDiv.innerHTML += `
                <div class="evolution-pokemon">

                    <img src="${
                        pokemon.sprites.other[
                            "official-artwork"
                        ].front_default
                    }">

                    <p>${nome}</p>

                </div>
            `;

            if(i < evolucoes.length - 1){

                evolutionDiv.innerHTML += `
                    <div class="evolution-arrow">
                        →
                    </div>
                `;
            }
        }

    }catch{

        evolutionDiv.innerHTML =
            "Evolução não encontrada.";
    }
}

document
.getElementById("pokemonInput")
.addEventListener("keypress",e=>{

    if(e.key==="Enter"){
        buscarPokemon();
    }

});

carregarTema();
renderizarFavoritos();
carregarPokemons();

async function carregarPokemons(){

    const grid =
        document.getElementById("pokemonGrid");

    grid.innerHTML =
        "<p>Carregando Pokémon...</p>";

    listaPokemon = [];

    const promises = [];

    for(let i=1;i<=151;i++){

        promises.push(
            fetch(
                `https://pokeapi.co/api/v2/pokemon/${i}`
            )
            .then(r=>r.json())
        );
    }

    listaPokemon =
        await Promise.all(promises);

    renderizarGrid(listaPokemon);
}

function renderizarGrid(lista){

    const grid =
        document.getElementById("pokemonGrid");

    grid.innerHTML = "";

    lista.forEach(pokemon=>{

        grid.innerHTML += `
            <div class="pokemon-mini-card"
                onclick="buscarPokemonGrid('${pokemon.name}')">

                <img src="${
                    pokemon.sprites.other[
                        'official-artwork'
                    ].front_default
                }">

                <h4>
                    #${pokemon.id}
                    ${pokemon.name}
                </h4>

            </div>
        `;
    });
}

function filtrarPorTipo(){

    const tipo =
        document.getElementById("typeFilter")
        .value;

    if(tipo===""){

        renderizarGrid(listaPokemon);
        return;
    }

    const filtrados =
        listaPokemon.filter(pokemon=>

            pokemon.types.some(
                t=>t.type.name===tipo
            )

        );

    renderizarGrid(filtrados);
}

function buscarPokemonGrid(nome){

    document.getElementById(
        "pokemonInput"
    ).value = nome;

    buscarPokemon();

    const btnPokedex =
        document.querySelector(".tab");

    abrirAba(
        "pokedex",
        btnPokedex
    );
}