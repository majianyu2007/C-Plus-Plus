#include <iostream>
#include <string>

using namespace std;

class Chair {
  private:
    string material;
    int legs;
    bool armrests;

  public:
    Chair() : material("wood"), legs(4), armrests(false) { cout << "默认构造的椅子~" << endl; }
    Chair(const string &material, int legs, bool armrests)
        : material(material), legs(legs), armrests(armrests) {
        cout << "带参数构造的椅子~" << endl;
    }
    Chair(const Chair &other)
        : material(other.material), legs(other.legs), armrests(other.armrests) {
        cout << "拷贝获得的椅子~" << endl;
    }
    virtual ~Chair() { cout << "椅子消失了/(ㄒoㄒ)/~~" << endl; }

    // 成员函数重载 +
    Chair operator+(const Chair &other) const {
        Chair result;
        result.material = material + other.material;
        result.legs = legs + other.legs;
        result.armrests = armrests || other.armrests;
        return result;
    }

    // 友元函数重载 +
    // friend Chair operator+(const Chair &lhs, const Chair &rhs);

    Chair &operator=(const Chair &other) {
        if (this != &other) {
            material = other.material;
            legs = other.legs;
            armrests = other.armrests;
        }
        return *this;
    }

    bool operator==(const Chair &other) const {
        return material == other.material && legs == other.legs && armrests == other.armrests;
    }

    Chair &operator++() {
        ++legs;
        return *this;
    }

    Chair operator++(int) {
        Chair temp(*this);
        ++(*this);
        return temp;
    }

    friend ostream &operator<<(ostream &os, const Chair &other) {
        os << "This chair has " << other.legs << " legs and is made of " << other.material
           << (other.armrests ? " with armrests." : " without armrests.") << endl;
        return os;
    }

    friend istream &operator>>(istream &is, Chair &other) {
        cout << "Please input material, legs and armrests:" << endl;
        is >> other.material >> other.legs >> other.armrests;
        return is;
    }
};

// Chair operator+(const Chair &lhs, const Chair &rhs) {
//     Chair result;
//     result.material = lhs.material + rhs.material;
//     result.legs = lhs.legs + rhs.legs;
//     result.armrests = lhs.armrests || rhs.armrests;
//     return result;
// }

int main() {
    Chair myChair_I("iron", 4, true);
    cout << myChair_I << endl;

    Chair chairofSuzume("wood", 3, false);
    cout << chairofSuzume << endl;

    Chair Combine_Chair_I;
    Combine_Chair_I = myChair_I + chairofSuzume;
    cout << Combine_Chair_I << endl;

    Chair myChair_II;
    cin >> myChair_II;
    cout << myChair_II << endl;

    if (myChair_I == myChair_II)
        cout << "I have two identical chairs!" << endl;
    else
        cout << "I have two different chairs" << endl;

    Chair myChair_III = myChair_II;
    cout << "I have a third chair: ";
    cout << myChair_III << endl;

    Chair chairofSuzume_fix = chairofSuzume;
    chairofSuzume_fix++;
    cout << "Chair of Suzume was repaired: " << endl;
    cout << chairofSuzume_fix << endl;

    Chair myChair_IV = ++chairofSuzume;
    cout << "I have the same chair as Suzume: " << endl;
    cout << myChair_IV << endl;

    return 0;
}
