class TicTacBoard {
    
    constructor(player_state){
        this._state = {
            ...player_state,
            finished: true,
            current: "player0",
            matrix: new Array(9).fill(0),
            figure_matrix : new Array(9).fill(undefined)
        }
        this._createBoard()
        this._updateScoreboard(true)
    }
    
    _line(from, to){
        this._ctx.moveTo(...from)
        this._ctx.lineTo(...to)
    }
    
    _markMatrix(res, value){
        const pos = res.y.matrix * 3 + res.x.matrix
        
        if(this._state.matrix[pos] !== 0)
            return false
        this._state.figure_matrix[pos] = {
            player: this._state.current,
            matrix: [res.x.matrix, res.y.matrix],
            pos: [res.x.coord, res.y.coord]
        }
        this._state.matrix[pos] = value
        return true
    }

    _checkMatrix(){
        
        const {matrix} = this._state
        
        for(var trg = 1; trg <= 2; trg++){
            for(var i = 0; i <= 6 ; i+=3)
                if(matrix.slice(i, i+3).every(x => x === trg))
                    return {
                        winner: `player${trg - 1}`,
                        coords: [[0, i], [1, i], [2, i]],
                    }

            for(var i = 0; i < 3; i++)
                if([matrix[i], matrix[i+3], matrix[i+6]].every(x => x === trg))
                    return {
                        winner: `player${trg - 1}`,
                        coords: [[i , 0], [i , 1], [i , 2]],
                    }

            if([matrix[0], matrix[4], matrix[8]].every(x => x === trg))
                return {
                    winner: `player${trg - 1}`,
                    coords: [[0 , 0], [1 , 1], [2 , 2]],
                }

            if([matrix[2], matrix[4], matrix[6]].every(x => x === trg))
                return {
                    winner: `player${trg - 1}`,
                    coords: [[2 , 0], [1 , 1], [0 , 2]],
                }
        }
        
        return undefined
    }

    _animateGrid(){

        var progress = 0

        const delays = [0, 0.35, 0.7, 1.05]

        const interval = setInterval(_ => {
            progress += 0.01
            this._drawGrid(delays, progress)
            if(progress >= delays[3] + 1){
                clearInterval(interval)
                this._state.finished = false
            }
        }, 7)
    }

    _determinePosition(event){
        
        const rect = this._canvas.getBoundingClientRect()

        const inRange = c => {
            for(var i = 0; i < 3; i++)
                if(c >= i * style.section && c < style.section * (i+1) )
                    return {
                        coord: i * style.section + style.margin * 1.6,
                        matrix: i
                    }
            return {coord: 0 , matrix: 0}
        }

        return {
            x: inRange(event.clientX - rect.left),
            y: inRange(event.clientY - rect.top)
        }

    }

    _move(event){
        
        const pos = this._determinePosition(event)
        if(this._markMatrix(pos, this._state.current === "player0" ? 1:2)) {
            this._ctx.drawImage(this._state[this._state.current].asset, pos.x.coord, pos.y.coord, 120, 120 )
            
            const status = this._checkMatrix()
            
            if(!status){
                this._state.current = this._state.current === "player0" ? "player1" : "player0"
                this._updateScoreboard()
            }
            else this._finish(status.coords, status.winner)
        }
    }

    _finish(coords, winner){
        this._state.finished = true
        $(`#sc-${winner}`).children().eq(0).css("color", "#a41a42")
        this._animateWinner(coords.map(t => t.map(j => j * style.section + style.margin * 1.6)), coords, this._state[winner].asset)
    }

    _drawGrid(delays, progress){

        this._ctx.clearRect(0, 0, style.canvas, style.canvas)
        this._ctx.beginPath()

        const {canvas, section, margin} = style

        for(var i = 1; i<3; i++)
            if(delays[i-1] <= progress)
                this._line([margin, i * section], [(canvas - margin) * Math.min(progress - delays[i-1], 1), i * section])

        for(var i = 1; i<3; i++)
            if(delays[i+1] <= progress)
                this._line([i * section, margin], [ i * section, (canvas - margin) * Math.min(progress - delays[i+1], 1)])

        this._ctx.stroke()
    }

    _updateScoreboard(initial){
        if(initial){
            $("#scoreboard").css("display", "flex")
            for(var i = 0; i<2; i++){
                const parent = $(`#sc-player${i}`)
                parent.children().eq(1).attr("src", this._state[`player${i}`].asset.src)
                parent.children().eq(0).text(this._state[`player${i}`].name)
            }
        }
        const another = this._state.current === "player0" ? "player1" : "player0"
        $(`#sc-${another}`).css("opacity", 0.5)
        $(`#sc-${this._state.current}`).css("opacity", 1)

    }

    _animateWinner(coords, coords_matrix, asset){
        var degrees = 0
        
        const match = figure => {
            if(!figure)
                return false
            const prcrt = JSON.stringify(coords_matrix)
            return prcrt.indexOf(JSON.stringify(figure.matrix)) == -1
        }
        
        const others = this._state.figure_matrix.filter(match)
        
        const interval = setInterval(_ => {
            degrees+=2
            this._ctx.clearRect(0, 0, style.canvas, style.canvas)
            this._drawGrid([0,0,0,0], 1)
            
            this._ctx.save()
            this._ctx.globalAlpha = 0.5
            others.forEach(anot => {
                this._ctx.drawImage(this._state[anot.player].asset, ...anot.pos, 120, 120)
            })
            this._ctx.restore()

            coords.forEach(c => {
                this._ctx.save()
                this._ctx.translate(c[0], c[1])
                this._ctx.translate(60, 60)
                this._ctx.rotate(degrees * Math.PI/180)
                this._ctx.drawImage(asset, -60, -60, 120, 120)
                this._ctx.restore()
            }) 
            
        }, 7)
    }

    
    _createBoard(){
        this._canvas = document.createElement('canvas')
        this._canvas.width = style.canvas
        this._canvas.height = style.canvas
        this._canvas.addEventListener('mouseup', function (event) {
            if(!this._state.finished)
                this._move(event)
        }.bind(this))
        document.getElementById('content').appendChild( this._canvas) 
        this._ctx =  this._canvas.getContext('2d')
        this._ctx.strokeStyle = '#9aa2b1'
        this._ctx.lineWidth = 10
        this._ctx.lineCap = "round"
        this._animateGrid()
    }
}

export default TicTacBoard

const style = {
    canvas: 500,
    section: 160,
    margin: 10
}