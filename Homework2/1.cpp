#include <iostream>
#include <vector>

using std::cin;
using std::cout;
using std::endl;
using std::vector;

void readArray(int arr[], int size) {
    for (int i = 0; i < size; i++) {
        cin >> arr[i];
    }
}

void readVector(std::vector<int>& vec, int size) {
    vec.clear();
    vec.reserve(size);
    for (int i = 0; i < size; i++) {
        int num;
        cin >> num;
        vec.push_back(num);
    }
}

bool areArraysEqual(const int arr1[], const int arr2[], int size) {
    for (int i = 0; i < size; i++) {
        if (arr1[i] != arr2[i]) {
            return false;
        }
    }
    return true;
}

bool areVectorsEqual(const vector<int>& vec1, const vector<int>& vec2) {
    return vec1 == vec2;
}

int main(void)
{
    const int size = 5;
    int arr1[size], arr2[size];
    vector<int> vec1, vec2;

    cout << "请输入第一个数组的 " << size << " 个整数：" << endl;
    readArray(arr1, size);
    cout << "请输入第二个数组的 " << size << " 个整数：" << endl;
    readArray(arr2, size);

    if (areArraysEqual(arr1, arr2, size)) {
        cout << "两个数组相等" << endl;
    } else {
        cout << "两个数组不相等" << endl;
    }

    cout << "请输入第一个 vector 的 " << size << " 个整数：" << endl;
    readVector(vec1, size);
    cout << "请输入第二个 vector 的 " << size << " 个整数：" << endl;
    readVector(vec2, size);

    if (areVectorsEqual(vec1, vec2)) {
        cout << "两个 vector 相等" << endl;
    } else {
        cout << "两个 vector 不相等" << endl;
    }

    return 0;
}