import TickTackBoard from './board.js'

const figures = Array(8).fill().map((_, i) => `../assets/figures/fig_${i}.png`)

const state = {
   selected_figures: []
}

const insertFigures = _ => {
    for(var i = 0; i < 2; i++){
        const parent = $(`#player${i}`).children().eq(1)
        figures.forEach((fig,ind) => parent.append(figure(fig, `fig_${ind}`, `fig fig_${ind}`, i)))
    }
}

const unselect = _class => {
    $(`.${_class}`).removeClass("fig-selected selected")
}

const start = (name0, name1) => {
    $("#setup").css("display","none")
    new TickTackBoard({
        player0: {
            name: name0,
            asset: figureLight(`../assets/figures/${state.selected_figures[0]}.png`)
        },
        player1: {
            name: name1,
            asset: figureLight(`../assets/figures/${state.selected_figures[1]}.png`)
        }
    })
}

$("#start").on('click', function(){
    if(state.selected_figures.length !== 2 )
        return
        
    const in0 = $("#in0").val(), in1 = $("#in1").val()
    
    if(in0 && in1 && in0.length > 0 && in1.length > 0)
        start(in0, in1)
})

$(document).on('click', ".fig", function(){

    if($(this).hasClass("fig-selected"))
        return
        
    const id = $(this).attr("id")
    const tag = $(this).attr("parent")
    
    if(state.selected_figures[tag])
        unselect(state.selected_figures[tag])
    
    $(`.${id}`).addClass("fig-selected")
    $(this).addClass("selected")
    
    state.selected_figures[tag] = id
})

const figure = (src, id, _class, tag) => {
    const img = new Image()
    img.src = src
    img.id = id
    img.className = _class
    img.setAttribute("parent", tag)
    return img
}

const figureLight = (src) => {
    const img = new Image()
    img.src = src
    return img
}

insertFigures()


