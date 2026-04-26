#include <iostream>
#include <string>

using namespace std;

class Chair {
  public:
    Chair() { cout << "创造了一把椅子！" << endl; }

    Chair(const Chair &) { cout << "创造了一把椅子！" << endl; }

    ~Chair() { cout << "椅子被破坏了！" << endl; }
};

class Person {
  private:
    string name;

  protected:
    string getName() const { return name; }

  public:
    Person(const string &n) : name(n) { cout << name << "向我走了过来！" << endl; }

    Person(const Person &other) : name(other.name) { cout << name << "又向我走了过来！" << endl; }

    ~Person() { cout << name << "离开了！" << endl; }
};

class ChairofSuzume : public Chair, public Person {
  public:
    ChairofSuzume(const string &name) : Chair(), Person(name) {
        cout << getName() << "的椅子被创造了出来！" << endl;
    }

    ChairofSuzume(const ChairofSuzume &other) : Chair(other), Person(other) {
        cout << getName() << "的椅子又被创造了出来！" << endl;
    }

    ~ChairofSuzume() { cout << getName() << "的椅子消失了！" << endl; }
};

int main() {
    ChairofSuzume broken_chair("Suzume");
    ChairofSuzume Souta(broken_chair);
    return 0;
}
