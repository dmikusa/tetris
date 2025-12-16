# Project Specification

At a high level, we are building a Tetris clone. Here are requirements. They are not in any particular order. Stories generated from these requirements should be put in an order such that we build a minimum viable product first, i.e. a minimally functional version of the game. Then more complicated features can be layer on top of that.

1. Logo. The game must use a variant of the Tetris logo. The guideline contains rules for the use of the logo and what modifications are acceptable. Here is a link to the logo: [https://tetris.wiki/Tetris_logo]

2. The playfield (known as the Matrix in the guideline) is 10 cells wide and 20 cells tall, with an additional 20 cell buffer zone above the top of the playfield, usually hidden or obstructed by the field frame. If the hardware permits, a sliver of the 21st row is shown to aid players manipulate the active piece in that area.

3. Tetrominoes appear on the 21st and 22nd rows of the playfield, centered and rounded to the left when needed. They must start with their flat side down, and move down immediately after appearing.

4. There are three types of Lock Down defined by the guideline, Infinite Placement Lock Down (or infinity), Extended Placement Lock Down (or move reset), and Classic Lock Down (or step reset). A piece has 0.5 seconds after landing on the stack before it locks down; for games with Master mode, the lock down delay value will decrease per level when the gravity is 20G. With infinity, rotating or moving the piece will reset this timer. With move reset, this is limited to 15 moves/rotations. Finally step reset will only reset the timer if the piece moves down a row. Some games have an option to change between 2 or 3 of these modes; later games use move reset as the only mode.

5. The piece previews, known as the Next Queue in the guideline, show the player the next pieces that will come into play. Some games have up to six previews, and some the option to change the amount. The queue can either be displayed on the right or the top of the playfield, with the next active piece being the closest to the top of the playfield. Pieces should be displayed in their starting orientations.

6. Hold is a mechanism that allows the player to store the active piece in the hold queue for later use. Only one piece can be in the hold queue. If there is already a piece in the hold queue, and the player holds the active piece, they are swapped, and the piece resets at the top of the playfield, becoming the new active piece. Hold cannot be used again until the piece locks down. Some games don't have the required space to display a hold piece, or that lack the necessary amount of buttons, may skip this mechanic. The combination of hold piece and Random Generator allows the player to play forever. For later games, Initial Hold System (IHS) may be included; IHS allows the next pieces to be held instantly during ARE by holding the Hold button.

7. Colors correspond to the shape of the tetromino.
    - light blue
    - dark blue
    - orange
    - yellow
    - green
    - red
    - magenta

8. The Random Generator (also known as "random bag" or "7 bag") determines the sequence of tetrominoes during gameplay. One of each of the 7 tetrominoes are shuffled in a "bag", and are dealt out one by one. When the bag is empty, a new one is filled and shuffled.

9. The ghost piece is a player aid that allows them to preview where pieces will fall to. It is usually semi transparent or represented by an outline, and does not interact with the active piece in any way. There is sometimes an option to disable it.

10. The following pieces are required:

    - "I" is Light blue; shaped like a capital I; four Minos in a straight line. Other names include straight, stick, and long. This is the only tetromino that can clear four lines outside of cascade games.
    - "O" is Yellow; a square shape; four Minos in a 2×2 square. Other names include square and block.
    - "T" is Purple; shaped like a capital T; a row of three Minos with one added above the center.
    - "S" is Green; shaped like a capital S; two stacked horizontal diminos with the top one offset to the right. Other names include inverse skew and right snake.
    - "Z" is Red; shaped like a capital Z; two stacked horizontal diminos with the top one offset to the left. Other names include skew and left snake.
    - "J" is Blue; shaped like a capital J; a row of three Minos with one added above the left side. Other names include gamma, inverse L, or left gun.
    - "L" is Orange; shaped like a capital L; a row of three Minos with one added above the right side. Other names include right gun.

11. All tetrominoes spawn horizontally. The I and O tetrominoes spawn centrally, and the other, 3-cell wide tetrominoes spawn rounded to the left. The J, L and T spawn flat-side first, while I, S and Z spawn in their upper horizontal orientation.

12. When unobstructed, the tetrominoes all appear to rotate purely about a single point. These apparent rotation centers are shown as circles in the diagram. For the I and O tetrominoes, the apparent rotation center is at the intersection of gridlines, whereas for the J, L, S, T and Z tetrominoes, the rotation center coincides with the center of one of the four constituent minos.

13. Here is a link to a graphic describing how the rotation works further: [https://tetris.wiki/images/3/3d/SRS-pieces.png]. The 4 rotation states of all 7 tetrominoes. Starting with the spawn state on the left, the 4 rotation states resulting from successive clockwise rotations are shown in order. The circles merely help to illustrate rotation centers and do not appear in-game.

14. Speed the blocks fall is determined by the defined gravity. As you play longer, the gravity will increase and the blocks will fall faster. You can start at different difficulty levels to start the gravity at different values.

15. Most Guideline games have a speed curve based on the curve used in Tetris Worlds. In this speed curve, the time for a piece to move down by one row is given by the following formula: `Time = (0.8-((Level-1)*0.007))(Level-1)`. Though the values produced by this formula have a huge number of decimal places, the following approximate G values retain frame-accuracy and are therefore indistinguishable from the formula.

    | Level | Speed (unit: G) |
    | ----- | --------------- |
    | 1     | 0.01667         |
    | 2     | 0.021017        |
    | 3     | 0.026977        |
    | 4     | 0.035256        |
    | 5     | 0.04693         |
    | 6     | 0.06361         |
    | 7     | 0.0879          |
    | 8     | 0.1236          |
    | 9     | 0.1775          |
    | 10    | 0.2598          |
    | 11    | 0.388           |
    | 12    | 0.59            |
    | 13    | 0.92            |
    | 14    | 1.46            |
    | 15    | 2.36            |
    | 16    | 3.91            |
    | 17    | 6.61            |
    | 18    | 11.43           |
    | 19    | 20.23           |
    | 20    | 36.6            |

16. There is a 0.5 second lock delay when gravity is less than 20G.

17. The player tops out when a piece is spawned overlapping at least one block, a piece locks completely above the visible portion of the playfield, or a block is pushed above the 20-row buffer zone.

18. Scoring is defined in this way.

    | Action | Points                 |
    | ------ | ---------------------- |
    | Single | 100 × level            |
    | Double | 300 × level            |
    | Triple | 500 × level            |
    | Tetris | 800 × level; difficult |

19. Standard mappings a desktop PC or any device with a keyboard: Up, Down, Left, Right arrow keys on the keyboard to perform locking hard drop, non-locking soft drop (except first frame locking in some games), left shift, and right shift respectively.

20. For a mobile device or touch screen device, we will use gestures for controls. Swipe up, down, left, right to perform locking hard drop, non-locking soft drop (except first frame locking in some games), left shift, and right shift respectively.
