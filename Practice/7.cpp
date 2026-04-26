#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <string>

using namespace std;

template <typename T> class Array {
  private:
    T *data;
    int n;

  public:
    explicit Array(int n) : data(nullptr), n(n) {
        if (n > 0) {
            data = new T[n];
        }
    }

    ~Array() { delete[] data; }

    T &operator[](int i) {
        if (i < 0 || i >= n) {
            cout << "Out of boundary!" << endl;
            exit(0);
        }
        return data[i];
    }

    const T &operator[](int i) const {
        if (i < 0 || i >= n) {
            cout << "Out of boundary!" << endl;
            exit(0);
        }
        return data[i];
    }

    void sort() { std::sort(data, data + n); }

    int search(T e) const {
        for (int i = 0; i < n; ++i) {
            if (data[i] == e) {
                return i;
            }
        }
        return -1;
    }

    int size() const { return n; }

    template <typename U> friend istream &operator>>(istream &in, Array<U> &arr);

    template <typename U> friend ostream &operator<<(ostream &out, const Array<U> &arr);
};

template <typename U> istream &operator>>(istream &in, Array<U> &arr) {
    for (int i = 0; i < arr.n; ++i) {
        in >> arr.data[i];
    }
    return in;
}

template <typename U> ostream &operator<<(ostream &out, const Array<U> &arr) {
    for (int i = 0; i < arr.n; ++i) {
        if (i > 0) {
            out << ' ';
        }
        out << arr.data[i];
    }
    return out;
}

template <typename T> void Process(Array<T> &a) {
    cin >> a;
    cout << a << endl;

    a.sort();
    cout << a << endl;

    int pos;
    cin >> pos;
    cout << a[pos] << endl;

    T key;
    cin >> key;
    cout << a.search(key) << endl;
}

int main() {
    string type;
    int n;

    cin >> type >> n;
    if (type == "int") {
        Array<int> a(n);
        Process(a);
    } else if (type == "double") {
        Array<double> a(n);
        Process(a);
    } else if (type == "string") {
        Array<string> a(n);
        Process(a);
    } else {
        cout << "Input error!" << endl;
    }

    return 0;
}
