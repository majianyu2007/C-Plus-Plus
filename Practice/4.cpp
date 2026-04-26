#include <iostream>
#include <limits>
#include <string>
#include <vector>

using namespace std;

class CAnimal {
  protected:
    string name;
    int age;

  public:
    CAnimal(const string &n, int a) : name(n), age(a) {
        cout << "Animal constructor: " << name << " " << age << endl;
    }

    virtual void Talk() {}

    virtual ~CAnimal() { cout << "Animal destructor " << endl; }
};

class CHorse : virtual public CAnimal {
  protected:
    int power;

  public:
    CHorse(const string &n, int a, int p) : CAnimal(n, a), power(p) {
        cout << "Horse constructor: " << power << endl;
    }

    void Talk() override { cout << "Whinny..." << endl; }

    ~CHorse() override { cout << "Horse destructor" << endl; }
};

class CBird : virtual public CAnimal {
  protected:
    float wingspan;

  public:
    CBird(const string &n, int a, float w) : CAnimal(n, a), wingspan(w) {
        cout << "Bird constructor: " << wingspan << endl;
    }

    void Talk() override { cout << "Chirp..." << endl; }

    ~CBird() override { cout << "Bird destructor" << endl; }
};

class CPegasus : public CHorse, public CBird {
  public:
    CPegasus(const string &n, int a, int p, float w)
        : CAnimal(n, a), CHorse(n, a, p), CBird(n, a, w) {
        cout << "Pegasus constructor" << endl;
    }

    void Talk() override { CHorse::Talk(); }

    ~CPegasus() override { cout << "Pegasus destructor" << endl; }
};

int main() {
    int n;
    if (!(cin >> n)) {
        return 0;
    }

    vector<CAnimal *> animals;
    animals.reserve(n);

    for (int i = 0; i < n; ++i) {
        string type;
        if (!(cin >> type)) {
            break;
        }

        if (type == "H") {
            string name;
            int age;
            int power;
            cin >> name >> age >> power;
            animals.push_back(new CHorse(name, age, power));
        } else if (type == "B") {
            string name;
            int age;
            float wingspan;
            cin >> name >> age >> wingspan;
            animals.push_back(new CBird(name, age, wingspan));
        } else if (type == "P") {
            string name;
            int age;
            int power;
            float wingspan;
            cin >> name >> age >> power >> wingspan;
            animals.push_back(new CPegasus(name, age, power, wingspan));
        } else {
            cout << "Input error!" << endl;
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
        }
    }

    for (CAnimal *animal : animals) {
        animal->Talk();
    }

    for (CAnimal *animal : animals) {
        delete animal;
    }

    return 0;
}
