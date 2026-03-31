#include <array>
#include <iostream>
#include <string>
#include <vector>

using std::array;
using std::cin;
using std::cout;
using std::endl;
using std::stoi;
using std::string;
using std::vector;

class Card {
private:
  char suit;
  string rank;

public:
  Card() : suit('S'), rank("A") {}

  explicit Card(const string &card) {
    suit = card[0];
    rank = card.substr(1);
  }

  int getScore() const {
    if (rank == "J" || rank == "Q" || rank == "K")
      return 10;
    if (rank == "A")
      return 11;
    return stoi(rank);
  }

  string toString() const { return string(1, suit) + rank; }
};

class Deck {
private:
  array<Card, 52> cards;

public:
  void read() {
    for (int i = 0; i < 52; ++i) {
      string card;
      cin >> card;
      cards[i] = Card(card);
    }
  }

  const Card &pick(int index) const { return cards.at(index); }
};

int main(void) {
  Deck deck;
  deck.read();

  vector<int> player1Indices(5), player2Indices(5);
  for (int i = 0; i < 5; i++)
    cin >> player1Indices[i];
  for (int i = 0; i < 5; i++)
    cin >> player2Indices[i];

  int score1 = 0, score2 = 0;
  cout << "Player 1 got: ";
  for (int i = 0; i < 5; ++i) {
    const Card &c = deck.pick(player1Indices[i]);
    if (i > 0)
      cout << " ";
    cout << c.toString();
    score1 += c.getScore();
  }
  cout << "\nPlayer 1 points: " << score1 << "\n";

  cout << "Player 2 got: ";
  for (int i = 0; i < 5; ++i) {
    const Card &c = deck.pick(player2Indices[i]);
    if (i > 0)
      cout << " ";
    cout << c.toString();
    score2 += c.getScore();
  }
  cout << "\nPlayer 2 points: " << score2 << "\n";

  if (score1 > score2)
    cout << "Player 1 wins!\n";
  else if (score2 > score1)
    cout << "Player 2 wins!\n";
  else
    cout << "Draw!\n";

  return 0;
}