#include <iostream>
#include <map>
#include <string>

using namespace std;

map<string, bool> memo;

// 返回true表示当前玩家能赢（对手会输），false表示当前玩家会输
bool canWin(string state) {
    if (state == "11111111") {
        // 棋盘满了，当前玩家输
        return false;
    }

    if (memo.count(state)) {
        return memo[state];
    }

    bool win = false;

    // 枚举所有可能的操作
    // 都在一行0上
    for (int i = 0; i < 4; i++) {
        if (state[i] == '0') {
            // 放1个棋子
            string next = state;
            next[i] = '1';
            if (!canWin(next)) {
                win = true;
            }
        }
    }

    for (int i = 0; i < 3; i++) {
        if (state[i] == '0' && state[i + 1] == '0') {
            // 放2个棋子
            string next = state;
            next[i] = '1';
            next[i + 1] = '1';
            if (!canWin(next)) {
                win = true;
            }
        }
    }

    // 都在行1上
    for (int i = 4; i < 8; i++) {
        if (state[i] == '0') {
            // 放1个棋子
            string next = state;
            next[i] = '1';
            if (!canWin(next)) {
                win = true;
            }
        }
    }

    for (int i = 4; i < 7; i++) {
        if (state[i] == '0' && state[i + 1] == '0') {
            // 放2个棋子
            string next = state;
            next[i] = '1';
            next[i + 1] = '1';
            if (!canWin(next)) {
                win = true;
            }
        }
    }

    memo[state] = win;
    return win;
}

int main() {
    // 四种情况
    string cases[4] = {
        "10000000", // X000 / 0000
        "11000000", // XX00 / 0000
        "01001000", // OXOO / 0000
        "01101000"  // OXXO / 0000
    };

    string result = "";
    for (int i = 0; i < 4; i++) {
        memo.clear();
        if (canWin(cases[i])) {
            result += "V";
        } else {
            result += "L";
        }
    }

    cout << result << endl;

    return 0;
}
