#include <algorithm>
#include <iostream>
#include <string>
using namespace std;

class Zombie {
  protected:
    int hp;
    int atk;
    int def;
    double speed;

  public:
    Zombie(int _hp, int _atk, int _def, double _speed)
        : hp(_hp), atk(_atk), def(_def), speed(_speed) {}

    virtual void talk() = 0;
    virtual void freeze() = 0;

    void ShowInfo() {
        cout << "Health: " << hp << "\tAttack: " << atk << "\tDefense: " << def
             << "\tSpeed: " << speed << endl;
    }

    double getSpeed() const { return speed; }
    int getHP() const { return hp; }
    void setSpeed(double s) { speed = s; }
    void setHP(int _hp) { hp = _hp; }
};

// 普通僵尸
class OrdinaryZombie : public Zombie {
  public:
    OrdinaryZombie(int _hp, int _atk, int _def) : Zombie(_hp, _atk, _def, 10.0) {}

    void talk() override { cout << "brains~~~" << endl; }

    void freeze() override {
        setSpeed(getSpeed() * 0.5);
        setHP(getHP() - 60 + def);
    }
};

// 路障僵尸
class RoadblockZombie : public Zombie {
  public:
    RoadblockZombie(int _hp, int _atk, int _def) : Zombie(_hp, _atk, _def, 10.0) {}

    void talk() override { cout << "brains~~~ There's a barricade on my head" << endl; }

    void freeze() override {
        setSpeed(getSpeed() * 0.8);
        setHP(getHP() - 60 + def);
    }
};

// 铁桶僵尸
class MetalBucketZombie : public Zombie {
  public:
    MetalBucketZombie(int _hp, int _atk, int _def) : Zombie(_hp, _atk, _def, 10.0) {}

    void talk() override { cout << "brains~~~ There's a bucket on my head" << endl; }

    void freeze() override {
        setSpeed(getSpeed() * 0.4);
        setHP(getHP() - 60 + def);
    }
};

// 报纸僵尸
class NewspaperZombie : public Zombie {
  private:
    bool newspaperDestroyed;

  public:
    NewspaperZombie(int _hp, int _atk, int _def)
        : Zombie(_hp, _atk, _def, 10.0), newspaperDestroyed(false) {}

    void talk() override {
        if (!newspaperDestroyed)
            cout << "I'm thinking..." << endl;
        else
            cout << "Ah ah ah~~~" << endl;
    }

    void freeze() override {
        setSpeed(getSpeed() * 0.5);
        setHP(getHP() - 60 + def);
        if (!newspaperDestroyed) {
            newspaperDestroyed = true;
            setSpeed(getSpeed() * 3);
        }
    }
};

void bubbleSort(Zombie *zombies[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - 1 - i; j++) {
            if (zombies[j]->getSpeed() < zombies[j + 1]->getSpeed()) {
                swap(zombies[j], zombies[j + 1]);
            }
        }
    }
}

int main(void) {
    cout << "僵尸群正在接近你的房子！" << endl;
    OrdinaryZombie Z1(100, 10, 10);
    RoadblockZombie Z2(100, 10, 30);
    MetalBucketZombie Z3(100, 10, 50);
    NewspaperZombie Z4(100, 10, 10);

    Zombie *zombies[] = {&Z1, &Z2, &Z3, &Z4};
    int n = sizeof(zombies) / sizeof(zombies[0]);
    for (int i = 0; i < n; i++) {
        zombies[i]->ShowInfo();
        zombies[i]->talk();
    }

    cout << "寒冰豌豆攻击了僵尸群！" << endl;
    for (int i = 0; i < n; i++) {
        zombies[i]->freeze();
    }
    // 调用冒泡排序函数进行排序
    bubbleSort(zombies, n);
    for (int i = 0; i < n; i++) {
        zombies[i]->ShowInfo();
        zombies[i]->talk();
    }
    return 0;
}
