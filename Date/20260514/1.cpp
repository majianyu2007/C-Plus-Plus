#include <iostream>
#include <string>
using namespace std;

template <class T, int size> class Data {
    T data[size];

  public:
    Data() {
        for (int i = 0; i < size; i++)
            data[i] = T();
        cout << "input " << size << " data:" << endl;
        for (int i = 0; i < size; i++)
            cin >> data[i];
    }
    T getMin() const;
};

template <class T, int size> T Data<T, size>::getMin() const {
    T Min = data[0];
    for (int i = 1; i < size; i++) {
        if (data[i] < Min) {
            Min = data[i];
        }
    }
    return Min;
}

int main() {
    Data<int, 5> d1;
    cout << "最小值为：" << d1.getMin() << endl;

    Data<char, 4> d2;
    cout << "最小值为：" << d2.getMin() << endl;

    Data<string, 3> d3;
    cout << "最小值为：" << d3.getMin() << endl;
    return 0;
}
