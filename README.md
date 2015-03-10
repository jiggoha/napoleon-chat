# napoleon-chat
Chat component of Napoleon game that will hopefully expand to the whole thing.
Express and Socket.IO practice.


Rules of the game found here: http://bantha.org/~develin/cardgames.html#ch6. My implementation assumes there are 4 players.


DONE

  Socket.io:
  * Broadcast a message to connected users when someone connects or disconnects
  * Add support for nicknames
  * When new users are added, they will see the most recent messages from before they joined
  * Don’t send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
  * Show who’s online
  * Add “{user} is typing” functionality
  
  Napoleon:
  * Creation of a deck of cards
  * Shuffling and dealing the deck of cards
  * After 4 players join, the deck is dealt and each player sees their hands
  * Hands are sorted after being dealt
  * Remove card when player clicks to play it
  * Only allows players to play a card when it is their turn
  * Function for determing the winning card of a trick


TODO

  Socket.io:
  * Add private messaging
  
  Napoleon:
  * Fix hacky dealing
  * My 12 year old brother just reminded me that not the same person leads every time. I need to fix this so that the winner of each trick leads the next.
  * Functions for declaring Napoleon and Secretary, for ending the game
  * Get user input for each of the above functions
