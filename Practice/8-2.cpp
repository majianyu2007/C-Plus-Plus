#include <iostream>
#include <memory>
#include <string>
#include <vector>

using namespace std;

class MediaAsset {
  public:
    MediaAsset() { cout << "Constructor media asset" << endl; }

    virtual ~MediaAsset() { cout << "Destructor media asset" << endl; }

    virtual void Show() = 0;
};

class Song : public MediaAsset {
  private:
    string artist;
    string title;

  public:
    Song(const string &artist, const string &title) : artist(artist), title(title) {
        cout << "Constructor song" << endl;
    }

    ~Song() override { cout << "Destructor song" << endl; }

    void Show() override { cout << artist << ", " << title << endl; }
};

class Photo : public MediaAsset {
  private:
    string date;
    string location;
    string subject;

  public:
    Photo(const string &date, const string &location, const string &subject)
        : date(date), location(location), subject(subject) {
        cout << "Constructor photo" << endl;
    }

    ~Photo() override { cout << "Destructor photo" << endl; }

    void Show() override { cout << date << ", " << location << ", " << subject << endl; }
};

int main() {
    string type;

    cin >> type;

    if (type == "shared_ptr") {
        vector<shared_ptr<MediaAsset>> assets{
            make_shared<Song>("Himesh Reshammiya", "Tera Surroor"),
            make_shared<Song>("Penaz Masani", "Tu Dil De De"),
            make_shared<Photo>("2011-04-06", "Redmond, WA", "Soccer field at a park."),
            make_shared<Song>("Bob Dylan", "The Times They Are A Changing"),
            make_shared<Song>("Aretha Franklin", "Bridge Over Troubled Water"),
            make_shared<Song>("Thala", "Entre El Mar y Una Estrella"),
            make_shared<Photo>("2021-12-06", "Xian, China", "Snowing at bell tower.")};

        vector<shared_ptr<MediaAsset>> photos;

        for (const auto &p : assets) {
            p->Show();
            shared_ptr<Photo> temp = dynamic_pointer_cast<Photo>(p);
            if (temp.get() != nullptr) {
                photos.push_back(p);
            }
        }

        for (const auto &p : photos) {
            p->Show();
        }
    } else if (type == "new") {
        vector<MediaAsset *> assets{
            new Song("Himesh Reshammiya", "Tera Surroor"),
            new Song("Penaz Masani", "Tu Dil De De"),
            new Photo("2011-04-06", "Redmond, WA", "Soccer field at a park."),
            new Song("Bob Dylan", "The Times They Are A Changing"),
            new Song("Aretha Franklin", "Bridge Over Troubled Water"),
            new Song("Thala", "Entre El Mar y Una Estrella"),
            new Photo("2021-12-06", "Xian, China", "Snowing at bell tower.")};

        vector<MediaAsset *> photos;

        for (const auto &p : assets) {
            p->Show();
            Photo *temp = dynamic_cast<Photo *>(p);
            if (temp != nullptr) {
                photos.push_back(p);
            }
        }

        for (const auto &p : photos) {
            p->Show();
        }
    } else {
        cout << "Input error!" << endl;
    }

    return 0;
}
