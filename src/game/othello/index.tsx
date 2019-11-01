import React, { Component } from 'react';
import ChessBoard, { Chess} from '../../component/ChessBoard';
import websocket from '../../component/Socket';

interface OthelloProps {

}

interface OthelloState {
    chesses: Chess[][];
    blackCount: number;
    whiteCount: number;
    lastStep: number[];
    currentCode: string;
    roomId: string;
}

export default class Othello extends Component<OthelloProps, OthelloState> {
    state: OthelloState = {
        blackCount: 0,
        whiteCount: 0,
        chesses: [],
        currentCode: "BLACK",
        lastStep: [-1,-1],
        roomId: 'othello-1',
    };

    constructor(props: OthelloProps) {
        super(props);
        let arr: Chess[][] = [];
        for(let x = 0; x < 8; x ++) {
            arr[x] = [];
            for (let y = 0; y < 8; y++) {
                arr[x][y] = {xPoint: x, yPoint: y, code: 'NULL'}
            }
        }
        this.state = {
            blackCount: 0,
            currentCode: "",
            lastStep: [],
            whiteCount: 0,
            chesses: arr,
            roomId: 'othello-1',
        }
    }

    componentDidMount(): void {
        websocket.onerror = this.handleError;
        websocket.onopen = this.handleOpen;
        websocket.onmessage = this.handleMessage;
        websocket.onclose = this.handleClose;
    }

    handleBuildMessage = (type: string, action: string, x?: number, y?: number): string => {
        const { roomId } = this.state;
        const data = JSON.stringify({x: x, y: y, childType: action});
        return JSON.stringify(
            {
                type: type,
                data: data,
                targetId: roomId,
            }
        );
    };

    handlePutChess = (x: number, y: number) => {
        websocket.send(this.handleBuildMessage('OTHELLO','PUT_CHESS', x, y));
    } ;

    handleClose = (evt: any) => {
        console.log(evt)
    };

    handleMessage = (evt: MessageEvent) => {
        if(evt.data){
            const data = JSON.parse(evt.data);
            if(data.success) {
                const message = data.data;
                if(message) {
                    this.setState({
                        chesses: message.table ? message.table : this.state.chesses,
                        currentCode: message.currentPlayer ? message.currentPlayer : this.state.currentCode,
                        lastStep: message.lastStep ? message.lastStep : this.state.lastStep,
                    });
                    if(message.winnerCode) {
                        alert("Game over ! " + message.winnerCode + " win!");
                    }
                }
            } else {
                console.log(data);
                alert(data.message);
            }
        }
    };
    handleError = (evt: any) => {
        console.log(evt)
    };
    handleOpen = (evt: any) => {
        console.log(evt);
        websocket.send(this.handleBuildMessage('OTHELLO','COME_ROOM'));
    };

    handleReady = () => {
        websocket.send(this.handleBuildMessage('OTHELLO','READY_GAME'))
    };

    test = () => {
        let arr: Chess[][] = [];
        for(let x = 0; x < 8; x ++) {
            arr[x] = [];
            for (let y = 0; y < 8; y++) {
                arr[x][y] = {xPoint: x, yPoint: y, code: 'BLACK'}
            }
        }
        this.setState({
            chesses: arr,
        });
    };

    public render() {
        const { chesses, lastStep, currentCode } = this.state;
        return (
            <div>
                <ChessBoard
                    chesses={chesses}
                    height={400}
                    width={400}
                    length={8}
                    lastStep={lastStep}
                    handleChessClick={this.handlePutChess}
                />
                <div>当前玩家:{currentCode}</div>
                <button onClick={this.handleReady} >准备</button>
            </div>
        )
    }

}
