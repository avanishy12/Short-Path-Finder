import pygame
import sys
import math
from tkinter import *
from tkinter import ttk
from tkinter import messagebox
import os

# Heuristic Function (Euclidean Distance)
def heuristic(n, e):
    return math.sqrt((n.i - e.i) ** 2 + (n.j - e.j) ** 2)

# Initialize Pygame
pygame.init()
screen = pygame.display.set_mode((800, 800))
pygame.display.set_caption("A* Pathfinding Algorithm")

# Grid Configuration
cols, row = 70, 70
w, h = 800 / cols, 800 / row  # Cell dimensions

# Colors
WHITE, RED, GREEN, BLUE, GREY, DARK_BLUE = (255, 255, 255), (255, 0, 0), (0, 255, 0), (0, 0, 255), (220, 220, 220), (0, 0, 205)

class Spot:
    def __init__(self, x, y):
        self.i, self.j = x, y
        self.f = self.g = self.h = 0
        self.neighbors = []
        self.previous = None
        self.obs = False
        self.closed = False
        self.value = 1  # Default movement cost

    def show(self, color, st):
        if not self.closed:
            pygame.draw.rect(screen, color, (self.i * w, self.j * h, w, h), st)
            pygame.display.update()

    def addNeighbors(self, grid):
        i, j = self.i, self.j
        if i < cols-1 and not grid[i + 1][j].obs: self.neighbors.append(grid[i + 1][j])
        if i > 0 and not grid[i - 1][j].obs: self.neighbors.append(grid[i - 1][j])
        if j < row-1 and not grid[i][j + 1].obs: self.neighbors.append(grid[i][j + 1])
        if j > 0 and not grid[i][j - 1].obs: self.neighbors.append(grid[i][j - 1])

# Initialize Grid
grid = [[Spot(i, j) for j in range(row)] for i in range(cols)]
openSet, closedSet = [], []
cameFrom = []

# Default Start & End Points
start, end = grid[12][5], grid[3][6]

# Display Grid
for i in range(cols):
    for j in range(row):
        grid[i][j].show(WHITE, 1)

# Create Borders
for i in range(row):
    for j in [0, row-1]:
        grid[j][i].obs = True
        grid[j][i].show(GREY, 0)
    for j in [0, cols-1]:
        grid[i][j].obs = True
        grid[i][j].show(GREY, 0)

# Tkinter Input Window for Start & End Points
def onsubmit():
    global start, end
    try:
        sx, sy = map(int, startBox.get().split(','))
        ex, ey = map(int, endBox.get().split(','))
        if 0 <= sx < cols and 0 <= sy < row and 0 <= ex < cols and 0 <= ey < row:
            start, end = grid[sx][sy], grid[ex][ey]
            window.quit()
            window.destroy()
        else:
            messagebox.showerror("Error", "Coordinates out of range! Use values between 0 and 69.")
    except (ValueError, IndexError):
        messagebox.showerror("Error", "Invalid format! Use numbers in 'x,y' format.")

# Create Tkinter Window
window = Tk()
Label(window, text='Start(x,y): ').grid(row=0, pady=3)
startBox = Entry(window)
startBox.grid(row=0, column=1, pady=3)

Label(window, text='End(x,y): ').grid(row=1, pady=3)
endBox = Entry(window)
endBox.grid(row=1, column=1, pady=3)

var = IntVar()
ttk.Checkbutton(window, text='Show Steps:', onvalue=1, offvalue=0, variable=var).grid(columnspan=2, row=2)
Button(window, text='Submit', command=onsubmit).grid(columnspan=2, row=3)

window.mainloop()

# Start Algorithm
openSet.append(start)
end.show(DARK_BLUE, 0)
start.show(DARK_BLUE, 0)

# Mouse Input for Obstacles
def mousePress(x):
    t, w = x
    g1, g2 = t // (800 // cols), w // (800 // row)
    cell = grid[g1][g2]
    if cell != start and cell != end and not cell.obs:
        cell.obs = True
        cell.show(WHITE, 0)

# Wait for User Input Before Pathfinding
loop = True
while loop:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        if pygame.mouse.get_pressed()[0]:  # Left Click to Add Obstacles
            try:
                mousePress(pygame.mouse.get_pos())
            except AttributeError:
                pass
        elif event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:  # Press SPACE to Start
            loop = False

# Add Neighbors to Grid
for i in range(cols):
    for j in range(row):
        grid[i][j].addNeighbors(grid)

def main():
    if openSet:
        lowestIndex = min(range(len(openSet)), key=lambda i: openSet[i].f)
        current = openSet[lowestIndex]

        if current == end:
            print(f'Done! Shortest Path Distance: {current.f} blocks')
            temp = current.f
            while current.previous:
                current.closed = False
                current.show(BLUE, 0)
                current = current.previous
            end.show(DARK_BLUE, 0)

            Tk().wm_withdraw()
            result = messagebox.askokcancel('Program Finished', f'The shortest distance is {temp} blocks.\nRe-run the program?')
            if result:
                os.execl(sys.executable, sys.executable, *sys.argv)
            else:
                while True:
                    if any(event.type == pygame.KEYDOWN for event in pygame.event.get()): break
            pygame.quit()
            sys.exit()

        openSet.pop(lowestIndex)
        closedSet.append(current)

        for neighbor in current.neighbors:
            if neighbor not in closedSet:
                tempG = current.g + current.value
                if neighbor in openSet:
                    if neighbor.g > tempG:
                        neighbor.g = tempG
                else:
                    neighbor.g = tempG
                    openSet.append(neighbor)

                neighbor.h = heuristic(neighbor, end)
                neighbor.f = neighbor.g + neighbor.h

                if neighbor.previous is None:
                    neighbor.previous = current

    if var.get():  # Show Steps if Checked
        for node in openSet: node.show(GREEN, 0)
        for node in closedSet:
            if node != start:
                node.show(RED, 0)

    current.closed = True

# Run Main Loop
while True:
    ev = pygame.event.poll()
    if ev.type == pygame.QUIT:
        pygame.quit()
        sys.exit()
    pygame.display.update()
    main()
