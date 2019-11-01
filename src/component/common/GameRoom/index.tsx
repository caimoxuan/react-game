import React, { Component } from 'react';

import DeskImg from '../../../img/game/desk.jpg';

interface GameRoomProps {
    roomTargetKey: string;
    maxRoomSize?: number;
    
}

interface GameRoomState {
    roomList: number[];
}

export default class GameRoom extends Component<GameRoomProps, GameRoomState> {

    state: GameRoomState = {
        roomList: []
    }

    constructor(props: GameRoomProps) {
        super(props);
        let length = props.maxRoomSize ? props.maxRoomSize : 12;
        let arr = [];
        for(let i = 0; i < length; i++) {
            arr.push(i);
        }
        this.state = {
            roomList: arr,
        }
    }

    render() {
        const { roomList } = this.state; 
        return (
            <div className="game-room-content">
            {
                roomList.map((v, index) => (
                    <div className="game-room-single">
                        <div className="game-site-left">
                            <img src={DeskImg} alt="" />
                        </div>
                        <div className="game-table">
                            <img src={DeskImg} alt="" />
                        </div>
                        <div className="game-site-right">
                            <img src={DeskImg} alt="" />
                        </div>
                    </div>  
                ))
            }
            </div>
        )
    }
}