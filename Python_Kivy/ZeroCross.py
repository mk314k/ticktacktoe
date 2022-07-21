class ZeroCross():
    """AI is creating summary for ZeroCross
    """
    def __init__(self, boardSize =3, zero = '0', cross='X', zeroIsFirst=True ) -> None:
        """AI is creating summary for __init__

        Args:
            boardSize (int, optional): [description]. Defaults to 3.
            zero (str, optional): [description]. Defaults to '0'.
            cross (str, optional): [description]. Defaults to 'X'.
            zeroIsFirst (bool, optional): [description]. Defaults to True.
        """
        self.__boardSize = boardSize
        self.__board = ['']*boardSize**2
        self.__zero = zero
        self.__cross = cross
        self.__chance = zero if zeroIsFirst else cross
        self.__gameState = None
        #self.checkRep()
    
    def checkRep(self):
        #assert(isinstance(self.__boardSize,int), "")#TODO
        #assert(self.__boardSize>3,"")#TODO
        pass

    def whoseChance(self):
        """AI is creating summary for whoseChance

        Returns:
            [type]: [description]
        """
        return self.__chance

    def __getitem__(self,index):
        """AI is creating summary for __getitem__

        Args:
            index ([type]): [description]

        Returns:
            [type]: [description]
        """
        #assert (isinstance(index,int) and index>=0 and index <self.__boardSize**2-1,"")#TODO
        return self.__board[index]

    def __setitem__(self,index,value):
        # assert (isinstance(index,int) and index>=0 and index <self.__boardSize**2-1,"")#TODO
        # assert (value in self.__allowedSymbol,"")#TODO
        self.__board[index] = value
        self.__gameState = self.__checkEnd()
        self.__chance = self.__zero if self.__chance == self.__cross else self.__cross

    def gameState(self):
        """AI is creating summary for gameState

        Returns:
            [type]: [description]
        """
        return self.__gameState

    def __checkEnd(self):
        """AI is creating summary for __checkEnd

        Returns:
            [type]: [description]
        """
        for i in range(self.__boardSize):
            rowResult = True
            colResult = True
            rowI = i*self.__boardSize
            for j in range(self.__boardSize):
                colJ = j * self.__boardSize
                rowResult = rowResult and self.__board[rowI+j] == self.__board[rowI] != ''
                colResult = colResult and self.__board[colJ+i] == self.__board[i] != ''
                if not (rowResult or colResult):
                    break
            if rowResult or colResult:
                return self.__chance
                break
        return None

    def __str__(self) -> str:
        return self.__board.__str__()

    def __repr__(self) -> str:
        return self.__str__()

    


    
