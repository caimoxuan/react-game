import React, { Component } from 'react';

import { message, PageHeader } from 'antd';

import DeskImg from '../../../img/game/desk.jpg';
import SiteOffImg from '../../../img/game/site1.jpg';
import SiteOnImg from '../../../img/game/site2.jpg';

import websocket from '../../Socket';

import './index.css';

interface RoomSite {
    roomId: string;
    leftSite: number;
    rightSite: number;
}

interface GameRoomProps {
    roomTargetKey: string;
    maxRoomSize?: number;
    history: any;
    roomType: string;
}

interface GameRoomState {
    roomList: RoomSite[];
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
            arr.push({leftSite: 0, rightSite: 0, roomId: props.roomTargetKey + i});
        }
        this.state = {
            roomList: arr,
        }
    }

    componentDidMount () {
        const { roomType } = this.props;
        let childData = JSON.stringify({childType: 'COME', parentRoomId: roomType});
        if (websocket.readyState === websocket.OPEN) {
            websocket.send(JSON.stringify({type: 'BASE', targetId: roomType, data: childData}));
        } else {
            message.error("与服务器连接异常!");
        }

        websocket.onmessage = (evt: any) => {
            const { roomList } = this.state;
            const data = JSON.parse(evt.data);
            console.log(data);
            if (data.success) {
                let roomSites = [];
                console.log(data.data);
                const roomsInfo = data.data.roomsInfo;
                if(roomsInfo){
                    for(let room of roomList) {
                        if(roomsInfo[room.roomId]) {
                            let roomInfo = roomsInfo[room.roomId];
                            roomSites.push({
                                roomId: room.roomId, 
                                leftSite: roomInfo.find((r: any) => (r.code === 'BLACK')) ? 1 : 0,
                                rightSite: roomInfo.find((r: any) => (r.code === 'WHITE')) ? 1 : 0,
                            })
                        } else {
                            roomSites.push(room);
                        }
                    }
                    this.setState({
                        roomList: roomSites
                    })
                }
            }
        }
    }

    handleEnterRoom = (targetId: string, siteType : number) => {
        if (websocket.readyState !== websocket.OPEN) {
            message.error("连接服务器失败，请稍后重试!");
            //return;
        }
        console.log(targetId, siteType);
        const { history } = this.props;
        history.push({
            pathname: '/othello/room',
            state: {
                roomId: targetId,
                siteType: siteType,
            }
        })
    }

    handleBackToHome = () => {
        const { history, roomType } = this.props;
        let childData = JSON.stringify({childType: 'LEAVE', parentRoomId: roomType});
        websocket.send(JSON.stringify({type: 'BASE', targetId: roomType, data: childData}));
        history.goBack();
    }

    render() {
        const { roomList } = this.state; 
        return (
            <div>
                <PageHeader
                    style={{color: 'white'}}
                    ghost={false}
                    onBack={this.handleBackToHome}
                    title="返回"
                    subTitle="回到主页"
                />
                <div className="game-room-content">
                    {
                        roomList.map((v, index) => (
                            <div className="game-room-single" key={index}>
                                <div className="game-site-left">
                                    <img className={v.leftSite === 0 ? "game-site-off" : "game-site-on"}
                                        src={v.leftSite === 0 ? SiteOffImg : SiteOnImg}
                                        alt=""
                                        onClick={() => this.handleEnterRoom(v.roomId, 0)} />
                                </div>
                                <div className="game-table">
                                    <img src={DeskImg} alt="" />
                                </div>
                                <div className="game-site-right">
                                    <img className={v.rightSite === 0 ? "game-site-off" : "game-site-on"}
                                        src={v.rightSite === 0 ? SiteOffImg : SiteOnImg} 
                                        alt=""
                                        onClick={() => this.handleEnterRoom(v.roomId, 1)} />
                                </div>
                            </div>  
                        ))
                    }
                </div>
            </div>
        )
    }
}