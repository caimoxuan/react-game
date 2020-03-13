var BS = 8; //BLORD SIZE
var CENTER = BS/2;
var BLACK = 1;
var WHITE = 2;

function pos(x: number ,y: number){
	return (x-1)+(y-1) * BS;
}

export default class Board {
	public data = new Array(BS*BS);
	public currentPlayer = BLACK;
    public history: any[] = [];

	//切换用户
	public trogglePlayer = () => {
		this.currentPlayer = ((this.currentPlayer===BLACK)?WHITE:BLACK);
	};
	//重置棋盘
	public reset = () => {
		for(var i=0;i<BS*BS;++i){
			this.data[i] = 0;
		}
		this.data[pos(CENTER,CENTER)] = this.data[pos(CENTER+1,CENTER+1)] = WHITE;
		this.data[pos(CENTER,CENTER+1)] = this.data[pos(CENTER+1,CENTER)] = BLACK;
		this.currentPlayer = BLACK;
		this.history = [];
	};
	//判断游戏结束
	public isGameOver = () => {
		var result = false;
		if(!this.canPutAnyChess()){
			this.trogglePlayer();
			if(!this.canPutAnyChess()){
				result = true;
			}
			this.trogglePlayer();
		}
		return result;
	}
	
	public getChess = (x: number ,y: number) => {
		return this.data[pos(x,y)];
	};
	
	public getPlayer = () => {
		return this.currentPlayer;
	}
	
	public getChessCount = (player: number) => {
		var b=0,w=0;
		for(var i=0;i<BS*BS;++i){
			if(this.data[i]===BLACK){
				++b;
			}
			else if(this.data[i]===WHITE){
				++w;
			}
		}
		
		if(player === BLACK){
			return b;
		}
		else if(player === WHITE){
			return w;
		}
		else{
			return [b,w];
		}
	}
	
	public check = (x: number,y: number,dx: number,dy: number,reverse?: boolean, cb?: (x: number, y: number) => void) => {
		var found = false;
		var c = 0;
		while(true){
			x += dx;
			y += dy;
			if( x<1 || x>BS || y<1 || y>BS){
				break;
			}					
			var chess = this.data[pos(x,y)];
			if(chess===0){
				break;
			}
			else if(chess===this.currentPlayer){
				found = true;
				break;
			}
			else{
				++c;
			}
		}
		if(c>0 && found){
			if(reverse){
				for(;c>0;--c){
					x -= dx;
					y -= dy;
					this.data[pos(x,y)] = this.currentPlayer;
					if(cb)cb(x,y);
				}
			}
			return true;
		}
		return false;
	};
	
	public canPutChess = (x: number,y: number) => {
		if(this.data[pos(x,y)]===0){
			if(this.check(x,y,1,1) || this.check(x,y,1,0) || this.check(x,y,1,-1) || this.check(x,y,0,1) || this.check(x,y,0,-1)
				|| this.check(x,y,-1,1) || this.check(x,y,-1,0) || this.check(x,y,-1,-1)){
				return true;
			}
		}
		return false;
	};
	
	public getPutableList = () => {
		var result = [];
		for(var x=1;x<=BS;++x){
			for(var y=1;y<=BS;++y){
				if(this.canPutChess(x,y)){
					result.push([x,y]);
				}
			}
		}
		return result;
	}
	
   public canPutAnyChess = () => {
		for(var x=1;x<=BS;++x){
			for(var y=1;y<=BS;++y){
				if(this.canPutChess(x,y)){
					return true;
				}
			}
		}
		return false;
	}
	
	public putChess = (x: number,y: number) => {
		if(this.data[pos(x,y)]===0){
			var changed = [];
			var saveChanged = function(tx: number,ty: number){
				changed.push([tx,ty]);
			};
			this.check(x,y,1,1,true,saveChanged);
			this.check(x,y,1,0,true,saveChanged);
			this.check(x,y,1,-1,true,saveChanged);
			this.check(x,y,0,1,true,saveChanged);
			this.check(x,y,0,-1,true,saveChanged);
			this.check(x,y,-1,-1,true,saveChanged);
			this.check(x,y,-1,0,true,saveChanged);
			this.check(x,y,-1,1,true,saveChanged);
			
			if (changed.length>0) {
				this.data[pos(x,y)] = this.currentPlayer;
				changed.push([x,y]);
				this.history.push(changed);
				this.trogglePlayer();
				return true;
			}
		}
		return false;
	};
	
	skipPutChess = () => {
		if(!this.canPutAnyChess()){
			this.history.push([]);
			this.trogglePlayer();
			return true;
		}
		return false;
	}
	
	undo = () => {
		if(this.history.length>0){
			var flipped = (this.history.length%2===0?BLACK:WHITE);
			var step = this.history.pop();
			if(step!=null && step.length>0){
				for(var i=0;i<step.length-1;++i){ //flip
					var chess = step[i];
					this.data[pos(chess[0],chess[1])] = flipped;
				}
				chess = step[step.length-1];
				this.data[pos(chess[0],chess[1])] = 0;
			}
			this.trogglePlayer();
			return true;
		}
		return false;
	};
	
	public _getData = () => {
		return this.data;
	}

}