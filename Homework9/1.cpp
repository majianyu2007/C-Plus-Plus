#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

using namespace std;

class Goods {
  public:
    Goods(string t, double pr) : title(t), price(pr) {}
    virtual ~Goods() {}

    virtual double getPrice() { return price; }
    virtual string getTitle() { return title; }
    virtual string getDetails() = 0;

  private:
    string title;
    double price;
};

class Book : public Goods {
  public:
    Book(string t, double pr)
        : Goods(t, pr), author("Unknown"), press("Unknown"), ISBN("Unknown") {}
    ~Book() {}

    void setDetails(string au, string pr, string isbn) {
        author = au;
        press = pr;
        ISBN = isbn;
    }

    string getDetails() {
        ostringstream os;
        os << "Book, author=" << author << ", press=" << press << ", ISBN=" << ISBN;
        return os.str();
    }

  private:
    string author;
    string press;
    string ISBN;
};

class Magazine : public Goods {
  public:
    Magazine(string t, double pr)
        : Goods(t, pr), issue("Unknown"), issNo("Unknown"), period("Unknown") {}
    ~Magazine() {}

    void setDetails(string isn, string p, string is) {
        issNo = isn;
        period = p;
        issue = is;
    }

    string getDetails() {
        ostringstream os;
        os << "Magazine, issueNo=" << issNo << ", period=" << period << ", issue=" << issue;
        return os.str();
    }

  private:
    string issue;
    string issNo;
    string period;
};

class MusicCD : public Goods {
  public:
    MusicCD(string t, double p)
        : Goods(t, p), player("Unknown"), style("Unknown"), tracks(0), lasttime(0) {}
    ~MusicCD() {}

    void setDetails(string p, string st, int tr, int t) {
        player = p;
        style = st;
        tracks = tr;
        lasttime = t;
    }

    string getDetails() {
        ostringstream os;
        os << "MusicCD, player=" << player << ", style=" << style << ", tracks=" << tracks
           << ", duration=" << lasttime << " min";
        return os.str();
    }

  private:
    string player;
    string style;
    int tracks;
    int lasttime;
};

class VCD : public Goods {
  public:
    VCD(string t, double p) : Goods(t, p), description("Unknown"), lasttime(0) {}
    ~VCD() {}

    void setDetails(int t, string des) {
        lasttime = t;
        description = des;
    }

    string getDetails() {
        ostringstream os;
        os << "VCD, description=" << description << ", duration=" << lasttime << " min";
        return os.str();
    }

  private:
    string description;
    int lasttime;
};

class Cart {
  public:
    Cart() {}
    ~Cart() {}

    void addItem(Goods *g) { items.push_back(g); }

    double totalPrice() {
        double sum = 0;
        for (size_t i = 0; i < items.size(); ++i) {
            sum += items[i]->getPrice();
        }
        return sum;
    }

    string goodsList() {
        ostringstream os;
        os << fixed << setprecision(2);
        os << "==== Goods List ====\n";
        for (size_t i = 0; i < items.size(); ++i) {
            os << i + 1 << ". " << items[i]->getTitle() << " | " << items[i]->getDetails()
               << " | price=" << items[i]->getPrice() << "\n";
        }
        return os.str();
    }

  private:
    vector<Goods *> items;
};

int main() {
    Cart ct;
    const int n = 4;
    Goods *gs[n] = {new MusicCD("Eagles", 12), new VCD("African Animals", 23),
                    new Book("The DaVinci Code", 22), new Magazine("Reader", 5)};

    dynamic_cast<MusicCD *>(gs[0])->setDetails("Eagles Band", "Rock", 10, 48);
    dynamic_cast<VCD *>(gs[1])->setDetails(95, "Wildlife Documentary");
    dynamic_cast<Book *>(gs[2])->setDetails("Dan Brown", "Doubleday", "9780385504201");
    dynamic_cast<Magazine *>(gs[3])->setDetails("2026-04", "Monthly", "No. 128");

    for (int i = 0; i < n; i++) {
        ct.addItem(gs[i]);
    }

    cout << ct.goodsList() << endl;
    cout << "Total Price: " << ct.totalPrice() << endl;

    for (int i = 0; i < n; i++) {
        delete gs[i];
    }

    return 0;
}
