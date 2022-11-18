//Fetch: falla cuando falla protocolo

//CLASES
class Vehiculo {
    id = "";
    modelo = "";
    anoFab = 1885;
    velMax=0;

    constructor(_id, _modelo, _anoFab, _velMax) {
        this.id=_id== null ? "" : _id;
        this.modelo= _modelo==null ? "" : _modelo;
        this.anoFab= _anoFab>1884 ? _anoFab : 1885;
        this.velMax= _velMax>-1 ? _velMax : _velMax;
    }
}

class Aereo extends Vehiculo{
    altMax=0;
    autonomia=0;

    constructor(_id, _modelo, _anoFab, _velMax, _altMax, _autonomia)
    {
        super(_id, _modelo, _anoFab, _velMax);
        this.altMax= _altMax>0 ? _altMax : 1;
        this.autonomia= _autonomia>0 ? _autonomia : 1;
    }
}

class Terrestre extends Vehiculo{
    cantPue=0;
    cantRue=0;

    constructor(_id, _modelo, _anoFab, _velMax, _cantPue, _cantRue)
    {
        super(_id, _modelo, _anoFab, _velMax);
        this.cantPue= _cantPue>0 ? _cantPue : 1;
        this.cantRue= _cantRue>0 ? _cantRue : 1;
    }
}

//DATOS
let datosJson;
let vehiculos = [];

//ABM
const abm=document.getElementById("form_abm");
let abmOperacion="";

//ABM - INPUTS
const abmInputId=document.getElementById("input_id")
const abmInputmodelo=document.getElementById("input_modelo")
const abmInputanoFab=document.getElementById("input_anoFab")
const abmInputvelMax=document.getElementById("input_velMax");
const abmInputTipo=document.getElementById("input_tipo");
const abmInputaltMax=document.getElementById("input_altMax");
const abmInputautonomia=document.getElementById("input_autonomia");
const abmInputcantPue=document.getElementById("input_cantPue");
const abmInputcantRue=document.getElementById("input_cantRue");

//ABM - BOTONES
const abmAceptar=document.getElementById("form_abm_btnAceptar");
const abmCancelar=document.getElementById("form_abm_btnCancelar");

//SPINNER
const spinner=document.getElementById("spinner");

traerDatosTabla();

//GET
//***XHTTP

mostrarSpinner();


function traerDatosTabla(){
    let consulta = fetch('http://localhost/vehiculoAereoTerrestre.php', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
    });

    consulta.then(respuesta =>{
        if (respuesta.status==200)
            return respuesta.json();
        alert("ERROR! Los registros no fueron cargados...");
    }).then(texto=>{
        datosJson = texto;
        const datos=datosJson;

        //PARSEAR DATOS
        datos.forEach(vehiculo => {
            let datos=[
                vehiculo.id,
                vehiculo.modelo,
                vehiculo.anoFab,
                vehiculo.velMax
            ];

            if (vehiculo.hasOwnProperty('altMax'))
                vehiculos.push(new Aereo(...datos, vehiculo.altMax, vehiculo.autonomia));
            else if(vehiculo.hasOwnProperty('cantPue'))
                vehiculos.push(new Terrestre(...datos, vehiculo.cantPue, vehiculo.cantRue));
            else
                vehiculos.push(new Vehiculo(...datos));
        });
        mostrarSpinner(false);
        generarTabla();
    });
}


function generarTabla(){
    document.getElementById('form_datos_tabla').remove();
    formTabla = document.createElement('table');
    formTabla.id='form_datos_tabla';

    let vehiculoDatosDefin=['id', 'modelo', 'anoFab', 'velMax', 'altMax', 'autonomia', 'cantPue', 'cantRue'];

    //HEAD Y BODY DE TABLA
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');

    for (let i = 0; i < vehiculoDatosDefin.length; i++) {
        let th = document.createElement('th');
        th.innerHTML=vehiculoDatosDefin[i].charAt(0).toUpperCase()+vehiculoDatosDefin[i].slice(1);
        thead.appendChild(th);
    }

    formTabla.appendChild(thead);
    formTabla.appendChild(tbody);

    //ESCRIBIR EN LA TABLA
    vehiculos.forEach(vehiculo => {
        let tr = document.createElement('tr');

        let vehiculoDatos=[vehiculo.id, vehiculo.modelo, vehiculo.anoFab, vehiculo.velMax,
                          vehiculo.altMax, vehiculo.autonomia,
                          vehiculo.cantPue, vehiculo.cantRue];

        for (let i = 0; i < vehiculoDatosDefin.length; i++) {
            escribirTd(vehiculoDatosDefin[i], vehiculoDatos[i]);
        }

        tr.setAttribute("id", vehiculo.id);

        //CLICK BOTON MODIFICAR
        let td = document.createElement('td');
        let btnModificar=document.createElement('button');
        btnModificar.innerHTML='Modificar';

        btnModificar.addEventListener("click", ()=>{
            vehiculos.forEach(vehiculo => {
                if (vehiculo.id==tr.id)
                    abrirAbm("modificar", vehiculo);
            });
        });

        td.appendChild(btnModificar);
        tr.appendChild(td);

        //CLICK BOTON ELIMINAR
        td = document.createElement('td');
        let btnEliminar=document.createElement('button');
        btnEliminar.innerHTML='Eliminar';

        btnEliminar.addEventListener("click", ()=>{
            vehiculos.forEach(vehiculo => {
                if (vehiculo.id==tr.id)
                    abrirAbm("eliminar", vehiculo);
            });
        });

        td.appendChild(btnEliminar);
        tr.appendChild(td);

        function escribirTd(_propStr, _prop){
            let td = document.createElement('td');
            td.innerHTML = (vehiculo.hasOwnProperty(_propStr))?_prop:'N/A';
            tr.appendChild(td);
        }

        formTabla.appendChild(tr);
    });

    //BOTON AGREGAR NUEVO REGISTRO
    btnAgregar=document.createElement('button');
    btnAgregar.innerHTML='Agregar elemento';
    btnAgregar.id='btnAgregar';
    btnAgregar.addEventListener("click", ()=>{
        abrirAbm("alta");
    });
    formTabla.appendChild(btnAgregar);
    document.getElementById("seccion_tabla").appendChild(formTabla);
}

//RELLENAR DATOS ABM
function rellenarAbm(vehiculo){

    escribirSiNoEsUndefined(abmInputmodelo, vehiculo.modelo);
    escribirSiNoEsUndefined(abmInputanoFab, vehiculo.anoFab);
    escribirSiNoEsUndefined(abmInputvelMax, vehiculo.velMax);
    
    if (vehiculo instanceof Aereo)
        abmInputTipo.selectedIndex=0;
    else if (vehiculo instanceof Terrestre)
        abmInputTipo.selectedIndex=1;

    escribirSiNoEsUndefined(abmInputaltMax, vehiculo.altMax);
    escribirSiNoEsUndefined(abmInputautonomia, vehiculo.autonomia);
    escribirSiNoEsUndefined(abmInputcantPue, vehiculo.cantPue);
    escribirSiNoEsUndefined(abmInputcantRue, vehiculo.cantRue);

    function escribirSiNoEsUndefined(_elemento, _valor){
        _elemento.value=_valor==undefined ? "" : _valor;
    }
}

//HABILITAR O NO LOS INPUT DEL ABM
function ajustarAbmSegunTipo(){
    
    //vehiculo
    abmInputmodelo.disabled=false;
    abmInputanoFab.disabled=false;
    abmInputvelMax.disabled=false;
    abmInputTipo.disabled=false;

    let boolAereo = abmInputTipo.selectedIndex==0;
    let boolTerrestre = abmInputTipo.selectedIndex==1;

    //AEREO
    abmInputaltMax.disabled=!boolAereo;
    abmInputautonomia.disabled=!boolAereo;

    //TERRESTRE
    abmInputcantPue.disabled=!boolTerrestre;
    abmInputcantRue.disabled=!boolTerrestre;
}

//DESHABILITO INPUTS SEGUN TIPO DE vehiculo
abmInputTipo.addEventListener("change", ajustarAbmSegunTipo);

//ABRIR TABLA REGISTROS
function abrirTabla(){
    abm.style.display="none";
    formTabla.style.display="";
    generarTabla();
}

//ABRIR ABM - OPERACIONES
function abrirAbm(_operacion, vehiculo){
    abm.style.display="";
    formTabla.style.display="none";
    abmInputId.disabled=true;
    abmOperacion=_operacion;
    
    if (!vehiculo instanceof Vehiculo)
        return;

    switch(_operacion)
    {
        case "alta":
            abmInputId.value="";
            rellenarAbm(new Vehiculo);
            ajustarAbmSegunTipo();
        break;
        case "modificar":
            abmInputId.value=vehiculo.id;
            abmInputId.setAttribute("id", vehiculo.id);
            abmInputId.disabled=true;
            rellenarAbm(vehiculo);
            ajustarAbmSegunTipo();
        break;
        case "eliminar":
            abmInputId.value=vehiculo.id;
            abmInputId.setAttribute("id", vehiculo.id);
            abmInputmodelo.disabled=true;
            abmInputanoFab.disabled=true;
            abmInputvelMax.disabled=true;
            abmInputTipo.disabled=true;
            abmInputaltMax.disabled=true;
            abmInputautonomia.disabled=true;
            abmInputcantPue.disabled=true;
            abmInputcantRue.disabled=true;
            rellenarAbm(vehiculo);
        break;
    }
}

//ABM - BOTONES
abmAceptar.addEventListener("click", ()=>{

    let vehiculo;
    let vehiculoId;

    switch(abmOperacion)
    {
        case "alta":
            if (!datosValidados())
                return;

            if(confirm("Desea agregar nuevo registro?"))
                agregarNuevoRegistro();
        break;
        case "modificar":
            if (!datosValidados())
                return;

            vehiculoId=abmInputId.id;
    
            vehiculos.forEach(item => {
                if (item.id==vehiculoId)
                    vehiculo=item;
            });
        
            if(confirm("Desea modificar este registro? ID: "+vehiculoId))
                modificarRegistro(vehiculo);
        break;
        case "eliminar":
            vehiculoId=abmInputId.id;
        
            vehiculos.forEach(item => {
                if (item.id==vehiculoId)
                    vehiculo=item;
            });
        
            if(confirm("Desea borrar este registro? ID: "+vehiculoId))
                eliminarRegistro(vehiculo);
        break;
    }
});

abmCancelar.addEventListener("click", abrirTabla);

//PUT - AGREGAR REGISTRO
//***SIN ASYNC

/*
function agregarNuevoRegistro()
{
    mostrarSpinner();

    let nuevoRegistro=crearvehiculoAbm();

    let consulta = fetch('http://localhost/vehiculoAereoTerrestre.php', {
        method: 'PUT',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer', 
        body: JSON.stringify(nuevoRegistro)
    });

    consulta.then(respuesta =>{
        if (respuesta.status==200)
            return respuesta.json();
        alert("ERROR! El registro no fue dado de alta...");
    }).then(texto=>{
        nuevoRegistro.id=texto.id;
        vehiculos.push(nuevoRegistro);
        mostrarSpinner(false);
        abrirTabla();
    });
}
*/

function agregarNuevoRegistro(){
    mostrarSpinner();

    var xhttp = new XMLHttpRequest();

    let nuevoRegistro=crearvehiculoAbm();

    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4){
            if (xhttp.status == 200)
            {
                nuevoRegistro.id=JSON.parse(xhttp.response).id;
                vehiculos.push(nuevoRegistro);
                mostrarSpinner(false);
                abrirTabla();
            }
            else
                alert("ERROR! El registro no fue dado de alta...");

            generarTabla();
            mostrarSpinner(false);
        }
    };
    xhttp.open("PUT", "http://localhost/vehiculoAereoTerrestre.php", true, "usuario", "pass");
    xhttp.send(JSON.stringify(nuevoRegistro));
}


//POST - MODIFICAR REGISTRO
//***ASYNC
async function modificarRegistro(_vehiculo)
{
    mostrarSpinner();

    let registroModificado;
    const index=vehiculos.indexOf(_vehiculo);

    if (~index)
        registroModificado=vehiculos[index];
    
    let respuesta = await fetch('http://localhost/vehiculoAereoTerrestre.php', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer', 
        body: JSON.stringify(registroModificado)
    });

    if (respuesta.status===200){
        let nuevoRegistro=crearvehiculoAbm();
        nuevoRegistro.id=registroModificado.id;
        vehiculos[index]=nuevoRegistro;
    }
    else
        alert("ERROR! los datos no fueron modificados...");
    
    mostrarSpinner(false);
    abrirTabla();
}

function eliminarRegistro(_vehiculo)
{
    mostrarSpinner();
    
    let registroEliminadoId;

    const index = vehiculos.indexOf(_vehiculo);
    if (~index)
        registroEliminadoId=vehiculos[index].id;
    
    let consulta = fetch('http://localhost/vehiculoAereoTerrestre.php', {
        method: 'DELETE',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer', 
        body: JSON.stringify({'id':registroEliminadoId})
    })
    
    consulta.then(respuesta =>{
        if (respuesta.status===200)
        {
            vehiculos.splice(index, 1);
            return respuesta.text();
        }
        else
            alert("ERROR! el registro no fue dado de baja...");
            
        mostrarSpinner(false);
        abrirTabla();
    });

}

//VALIDAR INPUTS ABM DONDE CORRESPONDA (REGEX)
function datosValidados(){
    const soloLetras=/^[A-Za-z\s]+$/;

    if(
        abmInputmodelo.value.match(soloLetras) &&
        (!isNaN(abmInputanoFab.value) && parseInt(abmInputanoFab.value)>-1) &&
        (!isNaN(abmInputvelMax.value) && parseInt(abmInputvelMax.value)>-1) &&
        (abmInputaltMax.disabled ? true : (!isNaN(abmInputaltMax.value) && parseInt(abmInputaltMax.value)>-1)) &&
        (abmInputautonomia.disabled ? true : (!isNaN(abmInputautonomia.value) && parseInt(abmInputautonomia.value)>-1)) &&
        (abmInputcantPue.disabled ? true : (!isNaN(abmInputcantPue.value) && parseInt(abmInputcantPue.value)>-1)) &&
        (abmInputcantRue.disabled ? true : (!isNaN(abmInputcantRue.value) && parseInt(abmInputcantRue.value)>-1))
    )
        return true;
    alert("Faltan datos por validar...");
}

//RETORNAR UNA vehiculo CREADA POR ABM
function crearvehiculoAbm() {
    let datos=[
        -1,
        abmInputmodelo.value.trim(),
        parseInt(abmInputanoFab.value),
        parseInt(abmInputvelMax.value)
    ];
    capitalizarString(datos);

    if (abmInputTipo.selectedIndex==0)
    {
        let datosAereo=[
            parseInt(abmInputaltMax.value),
            parseInt(abmInputautonomia.value),
        ];

        return new Aereo(...datos, ...datosAereo);
    }
    else if (abmInputTipo.selectedIndex==1)
    {
        let datosTerrestre=[
            parseInt(abmInputcantPue.value),
            parseInt(abmInputcantRue.value),
        ];

        return new Terrestre(...datos, ...datosTerrestre);
    }
    return new Vehiculo(...datos);
}

//CAPITALIZAR STRINGS
function capitalizarString(_arr){
    _arr.map((elemento, indice)=>{
        if (typeof _arr[indice] === 'string')
            _arr[indice]=_arr[indice].charAt(0).toUpperCase()+_arr[indice].slice(1);
    });
}

//SPINNER
function mostrarSpinner(_mostrar=true)
{
    spinner.style.display=_mostrar ? "" : "none";
}