from kivy.app import App
from kivy.clock import Clock
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.gridlayout import GridLayout
from kivy.uix.label import Label
from ZeroCross import ZeroCross


class KButton(Button):
    def __init__(self, id: int, **kwargs):
        super().__init__(**kwargs)
        self.id = id
        self.font_size = "36sp"
        self.bold = True


class MainWindow(BoxLayout):
    def __init__(self, **kwargs):
        super().__init__(orientation="vertical", padding=16, spacing=12, **kwargs)
        self.board_size = 3
        self.vs_computer = True
        self.ai_symbol = "X"
        self.game = ZeroCross(self.board_size, zero="O", cross="X", zeroIsFirst=True)
        self.scores = {"O": 0, "X": 0, "DRAW": 0}
        self.buttons = []

        # Top status & score bar
        header = BoxLayout(orientation="horizontal", size_hint_y=0.16, spacing=8)
        self.status_label = Label(
            text="Turn: O (Player)", font_size="20sp", bold=True
        )
        self.score_label = Label(
            text="O: 0  |  X: 0  |  Draws: 0", font_size="16sp"
        )
        header.add_widget(self.status_label)
        header.add_widget(self.score_label)
        self.add_widget(header)

        # 3x3 Board Grid
        self.grid = GridLayout(
            cols=self.board_size, rows=self.board_size, spacing=8, size_hint_y=0.70
        )
        for i in range(self.board_size**2):
            btn = KButton(id=i, text=self.game[i])
            btn.bind(on_press=self.handleClick)
            self.buttons.append(btn)
            self.grid.add_widget(btn)
        self.add_widget(self.grid)

        # Controls bar (Mode toggle & Reset)
        controls = BoxLayout(orientation="horizontal", size_hint_y=0.14, spacing=8)
        self.mode_btn = Button(text="Mode: vs Computer (AI = X)", font_size="16sp")
        self.mode_btn.bind(on_press=self.toggleMode)
        reset_btn = Button(text="New Round", font_size="16sp")
        reset_btn.bind(on_press=self.resetBoard)
        controls.add_widget(self.mode_btn)
        controls.add_widget(reset_btn)
        self.add_widget(controls)

    def handleClick(self, instance: KButton):
        if instance.text != "" or self.game.gameState() is not None:
            return
        if self.vs_computer and self.game.whoseChance() == self.ai_symbol:
            return

        self._applyMove(instance.id)
        if (
            self.vs_computer
            and self.game.gameState() is None
            and self.game.whoseChance() == self.ai_symbol
        ):
            Clock.schedule_once(self._triggerAiMove, 0.2)

    def _triggerAiMove(self, _dt):
        if self.game.gameState() is not None:
            return
        move = self.game.computeBestMove()
        if move is not None:
            self._applyMove(move)

    def _applyMove(self, idx: int):
        symbol = self.game.whoseChance()
        self.game[idx] = symbol
        self.buttons[idx].text = symbol

        state = self.game.gameState()
        if state is not None:
            self.scores[state] = self.scores.get(state, 0) + 1
            self.score_label.text = (
                f"O: {self.scores['O']}  |  X: {self.scores['X']}  |  Draws: {self.scores['DRAW']}"
            )
            win_line = self.game.winningLine()
            if win_line:
                for w_idx in win_line:
                    self.buttons[w_idx].background_color = (0.2, 0.75, 0.45, 1.0)
            self.status_label.text = (
                "Round Draw!" if state == "DRAW" else f"Winner: {state}!"
            )
        else:
            nxt = self.game.whoseChance()
            role = (
                "AI"
                if (self.vs_computer and nxt == self.ai_symbol)
                else "Player"
            )
            self.status_label.text = f"Turn: {nxt} ({role})"

    def toggleMode(self, _instance):
        self.vs_computer = not self.vs_computer
        self.mode_btn.text = (
            "Mode: vs Computer (AI = X)"
            if self.vs_computer
            else "Mode: Two Player (Pass & Play)"
        )
        self.resetBoard()

    def resetBoard(self, *_args):
        self.game.reset(zeroIsFirst=True)
        for btn in self.buttons:
            btn.text = ""
            btn.background_color = (1, 1, 1, 1)
        self.status_label.text = "Turn: O (Player)"


class MainApp(App):
    def build(self):
        self.title = "Tick Tack Toe — ZeroCross"
        return MainWindow()


if __name__ == "__main__":
    app = MainApp()
    app.run()
