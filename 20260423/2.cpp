#include <cstring>
#include <iostream>

using namespace std;

class CAnimal {
  public:
    CAnimal(char *strName = (char *)"", int a = 0, int w = 0) {
        strcpy(name, strName);
        age = a;
        weight = w;
        cout << "Animal constructor " << name << endl;
    }

    virtual ~CAnimal() { cout << "Animal destructor " << name << endl; }

    void Show() const { cout << name << " " << age << " " << weight << endl; }

  protected:
    char name[32];
    int age;
    int weight;
};

class CLion : virtual public CAnimal {
  public:
    CLion(char *strName = (char *)"", int a = 0, int w = 0, int mane = 0)
        : CAnimal(strName, a, w), m_mane(mane) {
        cout << "Lion constructor" << endl;
    }

    virtual ~CLion() { cout << "Lion destructor" << endl; }

    void Show() const {
        CAnimal::Show();
        if (m_mane) {
            cout << "This is a lion!" << endl;
        } else {
            cout << "This is a female lion!" << endl;
        }
    }

    void Talk() const {
        if (m_mane) {
            cout << "I'm in charge of protecting the territory!" << endl;
            cout << "I won't give in, cause I'm proud of all my scars!" << endl;
        } else {
            cout << "I do the hunting !" << endl;
            cout << "I'll get you ! You can't run away!" << endl;
        }
    }

  protected:
    int m_mane;
};

class CHorse : virtual public CAnimal {
  public:
    CHorse(int pow = 0, char *strName = (char *)"", int a = 0, int w = 0)
        : CAnimal(strName, a, w), m_power(pow) {
        cout << "Horse constructor" << endl;
    }

    virtual ~CHorse() { cout << "Horse destructor" << endl; }

    void Show() const {
        CAnimal::Show();
        cout << "Power:" << m_power << endl;
    }

    void Run() const { cout << "I can run! I run because I love to!!" << endl; }

    void Talk() const { cout << "Whinny!..." << endl; }

  protected:
    int m_power;
};

class CBird : virtual public CAnimal {
  public:
    CBird(int ws = 0, char *strName = (char *)"", int a = 0, int w = 0)
        : CAnimal(strName, a, w), m_wingspan(ws) {
        cout << "Bird constructor" << endl;
    }

    virtual ~CBird() { cout << "Bird destructor" << endl; }

    void Show() const {
        CAnimal::Show();
        cout << "Wingspan:" << m_wingspan << endl;
    }

    void Fly() const { cout << "I can fly! I can fly!!" << endl; }

    void Talk() const { cout << "Chirp..." << endl; }

  protected:
    int m_wingspan;
};

class CHippogriff : public CLion, public CHorse, public CBird {
  public:
    CHippogriff(char *strName = (char *)"", int a = 0, int w = 0, int ws = 0, int power = 0,
                int mane = 0, int ap = 500)
        : CAnimal(strName, a, w), CLion(strName, a, w, mane), CHorse(power, strName, a, w),
          CBird(ws, strName, a, w), AP(ap) {
        cout << "CHippogriff constructor" << endl;
    }

    ~CHippogriff() { cout << "CHippogriff destructor" << endl; }

    void Show() const {
        CBird::Show();
        CHorse::Show();
        CLion::Show();
        cout << "Attack Power = " << AP << endl;
    }

    void Talk() const { CLion::Talk(); }

  protected:
    int AP;
};

int main() {
    CHippogriff Leo((char *)"Leo", 5, 800, 2, 10000, 1, 1000);
    Leo.Show();
    Leo.Talk();

    CHippogriff Luna((char *)"Luna", 5, 800, 2, 10000, 0);
    Luna.Show();
    Luna.Talk();

    return 0;
}
