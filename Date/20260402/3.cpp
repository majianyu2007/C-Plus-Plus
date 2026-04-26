#include <cstring>
#include <iostream>
#include <utility>

using namespace std;

class Student {
  private:
    char *ID;
    char *name;
    char *address;
    int age;

  public:
    Student() {
        ID = new char[strlen("2024020001") + 1];
        strcpy(ID, "2024020001");

        name = new char[strlen("漩涡鸣人") + 1];
        strcpy(name, "漩涡鸣人");

        address = new char[strlen("木叶村") + 1];
        strcpy(address, "木叶村");

        age = 18;
        cout << name << "调用了默认的构造函数！" << endl;
    }

    Student(const char *id_, const char *name_, const char *address_, int age_)
        : ID(nullptr), name(nullptr), address(nullptr), age(age_) {
        ID = new char[strlen(id_) + 1];
        strcpy(ID, id_);

        name = new char[strlen(name_) + 1];
        strcpy(name, name_);

        address = new char[strlen(address_) + 1];
        strcpy(address, address_);

        cout << name << "调用了带参数的构造函数！" << endl;
    }

    Student(const char *id_, const char *name_) : Student(id_, name_, "学院都市", 16) {
        cout << name << "委托了带参数的构造函数构造对象！" << endl;
    }

    Student(const Student &other) : ID(nullptr), name(nullptr), address(nullptr), age(other.age) {
        ID = new char[strlen(other.ID) + 1];
        strcpy(ID, other.ID);

        name = new char[strlen(other.name) + 1];
        strcpy(name, other.name);

        address = new char[strlen(other.address) + 1];
        strcpy(address, other.address);

        cout << name << "调用了拷贝构造函数！" << endl;
    }

    Student(Student &&other) noexcept
        : ID(other.ID), name(other.name), address(other.address), age(other.age) {
        other.ID = nullptr;
        other.name = nullptr;
        other.address = nullptr;
        other.age = 0;
        cout << name << "调用了移动构造函数！" << endl;
    }

    ~Student() {
        if (name == nullptr) {
            cout << "空对象调用了析构函数！" << endl;
        } else {
            cout << name << "调用了析构函数！" << endl;
        }
        delete[] ID;
        delete[] name;
        delete[] address;
    }

    void Set_Inf(const char *id_, const char *name_, const char *address_, int age_) {
        delete[] ID;
        delete[] name;
        delete[] address;

        ID = new char[strlen(id_) + 1];
        strcpy(ID, id_);

        name = new char[strlen(name_) + 1];
        strcpy(name, name_);

        address = new char[strlen(address_) + 1];
        strcpy(address, address_);

        age = age_;
    }

    void Set_ID(const char *id_) {
        delete[] ID;
        ID = new char[strlen(id_) + 1];
        strcpy(ID, id_);
    }

    void Set_name(const char *name_) {
        delete[] name;
        name = new char[strlen(name_) + 1];
        strcpy(name, name_);
    }

    void Set_address(const char *address_) {
        delete[] address;
        address = new char[strlen(address_) + 1];
        strcpy(address, address_);
    }

    void Set_age(int age_) { age = age_; }

    const char *Get_name() const { return name == nullptr ? "空对象" : name; }

    void Inf_Print() const {
        cout << "ID: " << (ID == nullptr ? "空对象" : ID) << "，姓名："
             << (name == nullptr ? "空对象" : name) << "，年龄：" << age << "，来自："
             << (address == nullptr ? "空对象" : address) << endl;
    }
};

int main(void) {
    Student Naruto;
    Naruto.Inf_Print();
    Student Mikoto_Misaka("2024020002", "御坂美琴", "学院都市", 16);
    cout << Mikoto_Misaka.Get_name() << "在内存中的地址是：" << &Mikoto_Misaka << endl;
    Mikoto_Misaka.Inf_Print();
    Student Sasuke_Uchiha(Naruto);
    Sasuke_Uchiha.Set_ID("2024020003");
    Sasuke_Uchiha.Set_name("宇智波佐助");
    Sasuke_Uchiha.Inf_Print();
    Student Shirai_Kuroko("2024020004", "白井黑子");
    Shirai_Kuroko.Inf_Print();
    Student Sister_Misaka_I = std::move(Mikoto_Misaka);
    Sister_Misaka_I.Inf_Print();
    Sister_Misaka_I.Set_Inf("2024020005", "御坂妹", "学院都市", 1);
    Sister_Misaka_I.Inf_Print();
    return 0;
}
