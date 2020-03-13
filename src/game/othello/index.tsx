import React, { Component } from 'react';
import { Chess} from '../../types/game';
import ChessBoard from '../../component/ChessBoard'
import websocket from '../../component/Socket';
import { RouteComponentProps } from 'react-router-dom';
import { Button, message, PageHeader } from 'antd';

import Brain from './ai/ai2';
import Board from './ai/board';

import './index.css';

interface OthelloProps extends RouteComponentProps {
    
}

interface OthelloState {
    chesses: Chess[][];
    blackCount: number;
    whiteCount: number;
    lastStep: number[];
    currentCode: string;
    roomId: string;
    siteType: number;
    isReady: boolean;
    board: Board;
    ai: Brain;
}

export default class Othello extends Component<OthelloProps, OthelloState> {
    state: OthelloState = {
        blackCount: 0,
        whiteCount: 0,
        chesses: [],
        currentCode: "BLACK",
        lastStep: [-1,-1],
        roomId: 'othello-999',
        siteType: -1,
        isReady: false,
        board: new Board(),
        ai: new Brain()
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
            isReady: false,
            roomId: props.location.state.roomId,
            siteType: props.location.state.siteType,
            board: this.state.board,
            ai: this.state.ai
        }
    }

    componentDidMount() {
        if(websocket.readyState === websocket.OPEN) {
            websocket.send(this.handleBuildMessage('OTHELLO','COME_ROOM'));
        } else {
            message.error("服务器连接已断开!");
        }
        websocket.onerror = this.handleError;
        websocket.onmessage = this.handleMessage;
        websocket.onclose = this.handleClose;
    }

    handleBuildMessage = (type: string, action: string, x?: number, y?: number): string => {
        const { roomId, siteType } = this.state;
        const data = JSON.stringify({x: x, y: y, siteType: siteType, childType: action});
        return JSON.stringify(
            {
                type: type,
                data: data,
                targetId: roomId,
            }
        );
    };

    handlePutChess = (x: number, y: number) => {
        const { currentCode, isReady, board, ai, chesses } = this.state;
        if (!isReady) {
            if(chesses[x][y].code !== 'ALLOW') {
                return;
            }
            let result = board.putChess(y + 1, x + 1);
            let step = ai.findBestStep(board);
            let aiResult;
            if(step.length > 0) {
                aiResult = board.putChess(step[0], step[1]);
                while (board.getPutableList().length === 0 && aiResult) {
                    console.log("skip black");
                    board.skipPutChess();
                    step = ai.findBestStep(board);
                    aiResult = board.putChess(step[0], step[1]);
                }
            }
            if(result || aiResult) {
                if(aiResult) {
                    this.parseChessBoard([step[1] - 1, step[0] - 1]);
                } else {
                    this.parseChessBoard();
                }
                if (board.isGameOver()) {
                    setTimeout(() => {
                        alert("Game over! black: " + board.getChessCount(1) + "white: " + board.getChessCount(2));
                    }, 500);
                }
            } 
            return;
        }
        if (!currentCode || currentCode === '') {
            return;
        }
        websocket.send(this.handleBuildMessage('OTHELLO','PUT_CHESS', x, y));
    } ;

    handleClose = (evt: any) => {
        console.log(evt)
    };

    handleBackToBaseRoom = () => {
        const { history } = this.props;
        websocket.send(this.handleBuildMessage('OTHELLO','LEAVE_ROOM'));
        history.goBack();
    }

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
                        this.setState({
                            isReady: false
                        });
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

    handleReady = () => {
        websocket.send(this.handleBuildMessage('OTHELLO','READY_GAME'))
        this.setState({
            isReady: true,
        })
    };

    // 人机
    robotTrain = () => {
        const { board } = this.state;
        board.reset();
        this.parseChessBoard();
    }

    parseChessBoard = (lastStep?: number[]) => {
        const { board } = this.state;
        let chesses: Chess[][] = [];
        let player = board.getPlayer();
        let allowList = board.getPutableList();
        let chessList = board._getData();
        let y = 0;
        let row: Chess[] = [];
        for(let i = 0; i <= chessList.length; ++i) {
            if (i > 0 && i % 8 === 0) {
                chesses.push(row);
                row = [];
                y++;
            }   
            let code: "BLACK" | "WHITE" | "NULL" | "ALLOW" = chessList[i] === 1 ? 'BLACK' : chessList[i] === 2 ? "WHITE" : 'NULL';
            row.push({xPoint: i - y * 8, yPoint: y, code: code});
        } 
        for(let i = 0; i < allowList.length; i++) {
            let point = allowList[i];
            chesses[point[1] - 1][point[0] - 1].code = 'ALLOW';
        }
        this.setState ({
            chesses: chesses,
            currentCode: player === 1 ? 'BLACK' : 'WHITE',
            lastStep: lastStep ? lastStep : [],
        });
    }

    public render() {
        const { chesses, lastStep, currentCode, roomId, isReady } = this.state;
        return (
            <div style={{textAlign: 'center'}}>
                <PageHeader
                    style={{color: 'white'}}
                    ghost={false}
                    onBack={this.handleBackToBaseRoom}
                    title="返回"
                    subTitle="重新选择房间"
                />
                <div>房间：{roomId}</div>
                <ChessBoard
                    chesses={chesses}
                    height={400}
                    width={400}
                    length={8}
                    lastStep={lastStep}
                    handleChessClick={this.handlePutChess}
                />
                <div className="user-info-block">
                    <div>当前玩家:{currentCode}</div>
                    {
                        isReady ? null : 
                        <div>
                            <div><Button onClick={this.handleReady} >准备</Button></div>
                            <div><Button onClick={this.robotTrain} >人机练习</Button></div>
                        </div>
                    }
                </div>
            </div>
        )
    }

}
