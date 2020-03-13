var NORMAL = 1;
var BORDER = 4;
var CORNER = 64;
var BCORNER = -16;
var INFINITE = 999999;
var MIN_NODES = 10000;
var MIN_TICK = 1000;
var BS = 8; //BLORD SIZE

function posType(x: number,y: number){
	if( (x===1&&y===1) || (x===1&&y===BS) ||  (x===BS&&y===1) || (x===BS&&y===BS) ){
		return CORNER;
	}
	if( (x===1) || (x===BS) || (y===1) || (y===BS) ){
		return BORDER;
	}
	if( (x===2&&y===2) || (x===2&&y===BS-1) ||  (x===BS-1&&y===2) || (x===BS-1&&y===BS-1) ){
		return BCORNER;
	}
	return NORMAL;
}

export default class Brain {
	nodeCount = 0;
	defaultdepth = 7;
	maxdepth = 0;

	heuristic = (board: any, player: number) => {
		var	c1=0,c2=0;
		var s1=0,s2=0;
		for(var x=1;x<=BS;++x){
			for(var y=1;y<=BS;++y){
				var chess = board.getChess(x,y);
				if(chess === 0){
					continue;
				}
				else if(chess === player){
					++c1;
					s1 += posType(x,y);
				}
				else{
					++c2;
					s2 += posType(x,y);
				}
			}
		}
		//console.debug("c1:"+c1+",c2:"+c2+",s1:"+s1+",s2:"+s2);
		if(c1 === 0) return -INFINITE;
		if(c2 === 0) return INFINITE;
		if(c1+c2 === BS*BS){
			if(c1>c2) return INFINITE;
			else if(c2>c1) return -INFINITE;
		}
		return (s1-s2);
		//return (c1-c2)*(c1+c2)+(BS*BS-c1-c2)*(s1-s2);
	};
	
	getHeuristicValue = (board: any, player: number ,step: any[]) => {
		board.putChess(step[0],step[1]);
		var score = this.heuristic(board,player);
		board.undo();
		return score;
	}
	
	minimax = (board: any, player: number, depth: number, alpha: number,beta: number) => {
		if(depth === 0 || board.isGameOver()){
			++this.nodeCount;
			return {'score': this.heuristic(board,player),'step':[]};
		}
		var max = (board.getPlayer() === player);
		var score = max?(-INFINITE-1):(INFINITE+1);
		var steps = board.getPutableList();
		var bestStep = [0,0];
		if(steps.length>0){
			//sort the steps for better cut
			var heuristics: any ={};
			for(var i=0;i<steps.length;++i){
				var step = steps[i];
				heuristics[step]=this.getHeuristicValue(board,player,step);
			}
			steps.sort(function(a: number,b: number){
				return max?(heuristics[b]-heuristics[a]):(heuristics[a]-heuristics[b]);
			});

			for(var j=0;j<steps.length;++j){
				step = steps[j];
				board.putChess(step[0],step[1]);
				var ret = this.minimax(board, player,depth-1,alpha,beta);
				board.undo();
				if(depth === this.maxdepth){ //only output the first level
					console.debug("eval step:"+step+",score:"+ret.score+",depth:"+depth);
				}
				if(max){
					if(ret.score>score) {
						score = ret.score;
						bestStep[0] = step[0];
						bestStep[1] = step[1];
					}
					alpha = (alpha>score?alpha:score);
					if(alpha>=beta){ //beta cutoff
						break;
					}
				}
				else{
					if(ret.score<score) {
						score = ret.score;
						bestStep[0] = step[0];
						bestStep[1] = step[1];
					}
					beta = (beta<score?beta:score);
					if(alpha>=beta){ //alpha cutoff
						break;
					}
				}
			}
		}
		else{
			if(!board.isGameOver()){
				board.skipPutChess();
				ret = this.minimax(board, player,depth,alpha,beta);
				score = ret.score;
				bestStep = [];
				board.undo();
			}
			else{
				score = this.heuristic(board,player);
				bestStep = [];
			}
		}
		return {'score':score,'step':bestStep};
	}
	
	findBestStep = (board: any) => {
		var steps = board.getPutableList();
		var cc = board.getChessCount();
		var player = board.getPlayer();
		var chessCount = cc[0]+cc[1];
		//if chess count is less than (BS-2)^2 , take the random strategy
		if(steps.length>0 && chessCount<=((BS-4)*(BS-4))){
			console.debug("random strategy");
			var radSteps = [];
			for(var i=0;i<steps.length;++i){
				var step = steps[i];
				if(step[0]>=3 && step[0]<=(BS-2) && step[1]>=3 && step[1]<=(BS-2)){
					radSteps.push(step);
				}
			}
			if(radSteps.length>0){
				var ri = Math.floor((Math.random()*radSteps.length));
				return radSteps[ri];
			}
		}
		if(steps.length>0){
			console.debug("heuristic strategy");
			this.maxdepth = this.defaultdepth;
			var result;
			var totalTick = 0;
			do{
				console.debug("try depth:"+this.maxdepth);
				this.nodeCount = 0;
				var tick = (new Date()).getTime();
				result = this.minimax(board, player, this.maxdepth,-INFINITE,INFINITE);
				tick = (new Date()).getTime()-tick;
				totalTick += tick;
				console.debug("best step:"+result.step+",eval nodeCount:"+ this.nodeCount+",cost:"+tick+" ms");
				++this.maxdepth;
			}while((this.nodeCount<MIN_NODES||totalTick<MIN_TICK) && this.maxdepth<=(BS*BS-chessCount));
			return result.step;
		}
		return [];
	}
}