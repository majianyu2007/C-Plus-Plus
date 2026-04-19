#include <iostream>
#include <list>
#include <stdexcept>

using namespace std;

class CIntList {
  private:
    list<int> lst;

  public:
    CIntList() { lst.clear(); }

    void insert_front(int x) { lst.push_front(x); }
    void insert_back(int x) { lst.push_back(x); }

    int del_front() {
        if (lst.empty()) {
            throw out_of_range("list is empty");
        }
        int x = lst.front();
        lst.pop_front();
        return x;
    }

    int del_back() {
        if (lst.empty()) {
            throw out_of_range("list is empty");
        }
        int x = lst.back();
        lst.pop_back();
        return x;
    }

    int front() {
        if (lst.empty()) {
            throw out_of_range("list is empty");
        }
        return lst.front();
    }

    int back() {
        if (lst.empty()) {
            throw out_of_range("list is empty");
        }
        return lst.back();
    }

    bool empty() { return lst.empty(); }
};

class CIntStack : public CIntList {
  public:
    void push(int x) { insert_back(x); }

    int pop() { return del_back(); }

    int top() { return back(); }

    bool isEmpty() { return empty(); }
};

int main() {
    CIntStack st;
    st.push(10);
    st.push(20);
    st.push(30);

    cout << "Top: " << st.top() << endl;
    while (!st.isEmpty()) {
        cout << "Pop: " << st.pop() << endl;
    }

    return 0;
}
