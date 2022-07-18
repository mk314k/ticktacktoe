from kivy.app import App
from kivy.uix.button import Button
from kivy.uix.gridlayout import GridLayout

class KButton(Button):
    def __init__(self,id , **kwargs):
        super().__init__(**kwargs)
        self.id =id


class MainWindow(GridLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.__chance = "O"
        self.__game = [None] *9
        self.__status = True
        for i in range(9):
            button = KButton(id=i,text='')
            button.bind(on_press=self.clickButton)
            self.add_widget(button)

    def clickButton(self,instance):
        if instance.text == '' and self.__status:
            instance.text = self.__chance
            self.__game[instance.id] = self.__chance
            if self.__chance == 'O':
                self.__chance = 'X'
            else:
                self.__chance = 'O'
            self.__status = not self.checkEnd()

    
    def checkEnd(self):
        checkArray= [
            [0,1,2],
            [3,4,5],
            [6,7,8],
            [0,3,6],
            [1,4,7],
            [2,5,8],
            [0,4,8],
            [2,4,6]
        ]
        for arr in checkArray:
            if self.__game[arr[0]] == self.__game[arr[1]] == self.__game[arr[2]] != None:
                return True
        return False


    pass

class MainApp(App):
    pass

if __name__ == '__main__':
    app = MainApp()
    app.run()