from kivy.app import App
from kivy.uix.button import Button
from kivy.uix.gridlayout import GridLayout
from ZeroCross import ZeroCross

class KButton(Button):
    def __init__(self,id , **kwargs):
        super().__init__(**kwargs)
        self.id =id
        self.text = game[id]

class MainWindow(GridLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.cols = boardSize
        self.rows = boardSize
        for i in range(boardSize**2):
            button = KButton(id=i)
            button.bind(on_press=self.handleClick)
            self.add_widget(button)

    def handleClick(self,instance:KButton):
        if instance.text == '' and game.gameState()==None:
            instance.text = game.whoseChance()
            game[instance.id] = game.whoseChance()

class MainApp(App):
    pass

if __name__ == '__main__':
    boardSize = 3
    game = ZeroCross(boardSize)
    app = MainApp()
    app.run()