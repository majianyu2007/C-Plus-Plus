#include <iostream>
#include <list>
#include <vector>
using namespace std;

class MyList {
  private:
    list<int> my_list;

  public:
    void initList();
    void insertElements();
    void printByIterator();
    void printByRangeFor();
    void printReverse();
};

void MyList::initList() {
    for (int i = 1; i <= 5; i++) {
        my_list.push_back(i);
    }
}

void MyList::insertElements() {
    list<int>::iterator it;

    // 插入2个6：1 6 6 2 3 4 5
    it = my_list.begin();
    advance(it, 1);
    my_list.insert(it, 2, 6);

    // 插入2个7：1 6 6 7 7 2 3 4 5
    it = my_list.begin();
    advance(it, 3);
    my_list.insert(it, 2, 7);

    // 插入int型向量2个8
    vector<int> v8(2, 8);
    it = my_list.begin();
    advance(it, 7);
    my_list.insert(it, v8.begin(), v8.end());

    // 插入int型向量2个9
    vector<int> v9(2, 9);
    it = my_list.begin();
    advance(it, 10);
    my_list.insert(it, v9.begin(), v9.end());

    // 插入1个10
    it = my_list.begin();
    advance(it, 11);
    my_list.insert(it, 10);

    // 插入1个11
    it = my_list.begin();
    advance(it, 8);
    my_list.insert(it, 11);

    // 插入1个12
    it = my_list.begin();
    advance(it, 2);
    my_list.insert(it, 12);

    // 插入1个13
    it = my_list.begin();
    advance(it, 5);
    my_list.insert(it, 13);
}

void MyList::printByIterator() {
    cout << "利用迭代器输出mylist : ";
    for (list<int>::iterator it = my_list.begin(); it != my_list.end(); ++it) {
        cout << *it << " ";
    }
    cout << endl;
}

void MyList::printByRangeFor() {
    cout << "基于范围的for循环输出mylist : ";
    for (int x : my_list) {
        cout << x << " ";
    }
    cout << endl;
}

void MyList::printReverse() {
    cout << "反转输出mylist : ";
    for (list<int>::reverse_iterator it = my_list.rbegin(); it != my_list.rend(); ++it) {
        cout << *it << " ";
    }
    cout << endl;
}

int main() {
    MyList ml;
    ml.initList();
    ml.insertElements();
    ml.printByIterator();
    ml.printByRangeFor();
    ml.printReverse();

    return 0;
}
