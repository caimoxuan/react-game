import React, {Component } from 'react';
import { Chess } from '../../types/game';

export interface IChessBoardProps {
    chesses: Chess[][];
    width: number;
    height: number;
    length: number;
    lastStep: number[];
    handleChessClick: (x: number, y: number) => void;
}

export interface IChessBoardState {
    offset: number;
    lastHighlightX: number;
    lastHighlightY: number;
}

export default class ChessBoard extends Component<IChessBoardProps, IChessBoardState> {
    canvas: HTMLCanvasElement | null | undefined;
    state: IChessBoardState;
    constructor(props: IChessBoardProps) {
        super(props);
        this.state = {
            offset:  props.width / props.length > props.height / props.length ? props.width / props.length : props.height / props.length,
            lastHighlightX: -99,
            lastHighlightY: -99,
        }
    };

    componentDidMount(): void {
        const {length, width, height, handleChessClick } = this.props;
        const { offset } = this.state;
        const gridWidth = width / length;
        const gridHeight = height /length;
        if(this.canvas) {
            let ctx = this.canvas.getContext('2d');
            const canvasTop = this.canvas.offsetTop;
            const canvasLeft = this.canvas.offsetLeft;
            if(ctx){
                this.drawBoard(ctx);
                //鼠标移动监听
                this.canvas.addEventListener('mousemove', (event: MouseEvent) => {
                    let mouseX = Math.ceil((event.pageX - canvasLeft - offset) / gridWidth) - 1;
                    let mouseY = Math.ceil((event.pageY - canvasTop - offset) / gridHeight) - 1;
                    if(mouseX >= 0 && mouseX < length && mouseY >=0 && mouseY < length) {
                        if(ctx){
                            this.highlightCell(mouseX, mouseY, ctx);
                        }
                    }
                });
                //点击事件监听
                this.canvas.addEventListener('click', (evt) => {
                    let mouseX = Math.ceil((evt.pageX - canvasLeft - offset) / gridWidth) - 1;
                    let mouseY = Math.ceil((evt.pageY - canvasTop - offset) / gridHeight) - 1;
                    if(mouseX >= 0 && mouseX < length && mouseY >=0 && mouseY < length) {
                        handleChessClick(mouseX, mouseY);
                    }
                });
            }
        }
    };

    shouldComponentUpdate(nextProps: Readonly<IChessBoardProps>, nextState: Readonly<IChessBoardState>, nextContext: any): boolean {
        const { chesses } = this.props;
        return chesses !== nextProps.chesses;
    };

    componentDidUpdate(): void {
        if(this.canvas) {
            let ctx = this.canvas.getContext('2d');
            if(ctx){
                this.drawBoard(ctx);
            }
        }
    };

    drawBoard(ctx: CanvasRenderingContext2D) {
        const { width, height } = this.props;
        const { offset } = this.state;
        ctx.fillStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.fillRect(0, 0, width + 2*offset, height + 2*offset);
        this.drawChessBoard(ctx);
        this.drawChesses(ctx);
    };

    drawChesses = (ctx: CanvasRenderingContext2D) => {
        const { chesses, length, width, height } = this.props;
        if(!chesses) return;
        const gridWidth = width / length;
        const gridHeight = height /length;
        for(let i = 0; i < length; i++) {
            for(let y = 0; y < length; y++) {
                if(chesses[i][y] && chesses[i][y].code){
                    const code = chesses[i][y].code;
                    if(code === 'NULL') {
                        continue;
                    }
                    if (code === 'BLACK') {
                        this.drawBlackChess(i, y, gridWidth, gridHeight, ctx)
                    } else if (code === 'WHITE') {
                        this.drawWhiteChess(i, y, gridWidth, gridHeight, ctx)
                    }else if (code === 'ALLOW') {
                        this.drawAllowChess(i, y, gridWidth, gridHeight, ctx);
                    }
                }
            }
        }
        this.drawLastStep(gridWidth, gridHeight, ctx);
    };

    drawBlackChess = (x: number, y: number, width: number, height: number, ctx: CanvasRenderingContext2D) => {
        const { offset } = this.state;
        ctx.beginPath();
        let g = ctx.createRadialGradient(offset + x*width+width/2,offset + y*height+height/2,13,offset + x*width+width/2,offset + y*height+height/2,0);//设置渐变
        g.addColorStop(0,'#0A0A0A');//黑棋
        g.addColorStop(1,'#636766');
        ctx.fillStyle=g;
        ctx.arc(offset + x*width+width/2,offset + y*height+height/2,13,0,2*Math.PI);//绘制棋子
        ctx.fill();
        ctx.closePath();
    };

    drawWhiteChess = (x: number, y: number, width: number, height: number, ctx: CanvasRenderingContext2D) => {
        const { offset } = this.state;
        ctx.beginPath();
        let g = ctx.createRadialGradient(offset + x*width+width/2,offset + y*height+height/2,13,offset + x*width+width/2,offset + y*height+height/2,0);//设置渐变
        g.addColorStop(0,'#D1D1D1');//白棋
        g.addColorStop(1,'#F9F9F9');
        ctx.fillStyle=g;
        ctx.arc(offset + x*width+width/2,offset + y*height+height/2, 13,0,2*Math.PI);//绘制棋子
        ctx.fill();
        ctx.closePath();
    };

    drawAllowChess = (x: number, y: number, width: number, height: number, ctx: CanvasRenderingContext2D) => {
        const { offset } = this.state;
        ctx.fillStyle='green';
        //绘制成矩形
        ctx.fillRect(offset + x*width + width/2 - 2,offset + y*height + height/2 - 2,4,4);
    };

    drawLastStep(width: number, height: number, ctx: CanvasRenderingContext2D) {
        const { lastStep } = this.props;
        const { offset } = this.state;
        if(!lastStep) {
            return;
        }
        const x = lastStep[0];
        const y = lastStep[1];
        if(x != null && y != null) {
            ctx.fillStyle = "red";
            ctx.fillRect(offset + x*width + width/2 - 2,offset + y*height + height/2 - 2,4,4);
        }
    }

    drawChessBoard = (ctx: CanvasRenderingContext2D) => {
        const {length, width, height} = this.props;
        const { offset } = this.state;
        const gridWidth = width / length;
        const gridHeight = height /length;
        ctx.strokeStyle='#000';
        for(let i = 0; i <= height; i++) {
            ctx.beginPath();
            ctx.moveTo(offset + i*gridWidth,offset);//垂直方向画
            ctx.lineTo(offset + i*gridWidth, height + offset);
            ctx.stroke();
            ctx.moveTo(offset,offset + i*gridHeight);//水平方向画
            ctx.lineTo(offset + width,offset + i*gridHeight);
            ctx.stroke();
            ctx.closePath();
        }
    };

    highlightCell = (x: number, y: number, ctx: CanvasRenderingContext2D) => {
        const { length } = this.props;
        const { lastHighlightX, lastHighlightY } = this.state;
        if(x === lastHighlightX && y === lastHighlightY) {
            return;
        }
        if(lastHighlightX >= 0 && lastHighlightX < length && lastHighlightY >=0 && lastHighlightY < length) {
            this.drawHighlightCell(lastHighlightX, lastHighlightY, ctx, '#000');
        }
        if(x >= 0 && x < length && y >=0 && y < length) {
            this.drawHighlightCell(x, y, ctx, 'red');
        }
        this.setState({
            lastHighlightX: x,
            lastHighlightY: y,
        });
    };

    drawHighlightCell = (x: number, y: number, ctx: CanvasRenderingContext2D, style: string) => {
        const { width, height,length } = this.props;
        const { offset } = this.state;
        const gridWidth = width / length;
        const gridHeight = height /length;
        ctx.strokeStyle = style;
        ctx.strokeRect(offset + x*gridWidth, offset + y*gridHeight, gridWidth, gridHeight);
    };

    public render() {
        const { width, height } = this.props;
        const { offset } = this.state;
        return (
            <div style={{margin: '40px auto'}}>
                <canvas id="board" width={width + 2*offset} height={height + 2*offset} ref={node => this.canvas = node}/>
            </div>
        )
    }
}
